import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import http from 'http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Render expects port 10000
const RENDER_PORT = process.env.PORT || 10000;
// Use a different port for the internal Next.js server
const NEXT_PORT = 3000;

console.log(`Render expects port: ${RENDER_PORT}`);
console.log(`Next.js is using port: ${NEXT_PORT}`);

// Function to check if Next.js is ready
const waitForNextJsReady = (retries = 30, delay = 1000) => {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    const checkServer = () => {
      console.log(`Checking if Next.js is ready (attempt ${attempts + 1}/${retries})...`);
      
      const req = http.get(`http://localhost:${NEXT_PORT}`, res => {
        console.log(`Next.js responded with status: ${res.statusCode}`);
        if (res.statusCode === 200) {
          resolve();
        } else {
          retry();
        }
      });
      
      req.on('error', (err) => {
        console.log(`Next.js check failed: ${err.message}`);
        retry();
      });
      
      req.setTimeout(2000, () => {
        req.destroy();
        console.log('Next.js check timed out');
        retry();
      });
    };
    
    const retry = () => {
      attempts++;
      if (attempts >= retries) {
        reject(new Error(`Next.js did not become ready after ${retries} attempts`));
        return;
      }
      
      setTimeout(checkServer, delay);
    };
    
    checkServer();
  });
};

// Start the Next.js standalone server with a different port
const startNextServer = () => {
  console.log(`Starting Next.js standalone server on internal port: ${NEXT_PORT}`);

  // Set environment variables for the child process
  const env = {
    ...process.env,
    PORT: NEXT_PORT,
  };

  const server = spawn('node', ['.next/standalone/server.js'], {
    env,
    stdio: 'inherit',
    cwd: __dirname,
  });

  server.on('close', (code) => {
    console.log(`Next.js server process exited with code ${code}`);
    process.exit(code);
  });

  return server;
};

// Create a proxy server to forward requests
const createProxyServer = () => {
  const app = express();
  
  // Log all requests
  app.use((req, res, next) => {
    console.log(`Request received: ${req.method} ${req.url}`);
    next();
  });

  // Add a health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).send('OK');
  });

  // Add a fallback for when Next.js is not responding
  app.use((req, res, next) => {
    // Continue to proxy if path exists
    next();
  }, (req, res) => {
    // This will only be reached if the proxy middleware doesn't handle the request
    res.status(500).send('The application is currently starting up. Please try again in a moment.');
  });

  // Set up the proxy to forward to the Next.js server
  app.use('/', createProxyMiddleware({
    target: `http://localhost:${NEXT_PORT}`,
    changeOrigin: true,
    ws: true,
    logLevel: 'debug',
    proxyTimeout: 10000,
    timeout: 10000,
    onError: (err, req, res) => {
      console.error(`Proxy error: ${err.message}`);
      res.writeHead(500, {
        'Content-Type': 'text/plain'
      });
      res.end('The application server is currently unavailable. Please try again in a few moments.');
    }
  }));

  // Start listening on the Render port
  const server = app.listen(RENDER_PORT, '0.0.0.0', () => {
    console.log(`Proxy server listening on port ${RENDER_PORT} -> forwarding to ${NEXT_PORT}`);
  });

  server.on('error', (error) => {
    console.error(`Server error: ${error.message}`);
  });

  return server;
};

// Main execution
const main = async () => {
  try {
    // Start Next.js server
    const nextServer = startNextServer();
    
    // Wait for Next.js to be ready (with timeout)
    try {
      console.log('Waiting for Next.js to be ready...');
      await waitForNextJsReady();
      console.log('Next.js is ready, starting proxy server');
    } catch (error) {
      console.warn(`Warning: ${error.message}. Starting proxy anyway.`);
    }
    
    // Create proxy server
    createProxyServer();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
};

main();