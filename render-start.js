import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Render expects port 10000
const RENDER_PORT = process.env.PORT || 10000;
// Use a different port for the internal Next.js server
const NEXT_PORT = 3000;

console.log(`Render expects port: ${RENDER_PORT}`);
console.log(`Next.js is using port: ${NEXT_PORT}`);

// Create a simple middleware to route requests
const createServer = () => {
  const app = express();
  
  // Simple middleware to log requests
  app.use((req, res, next) => {
    console.log(`Request received: ${req.method} ${req.url}`);
    next();
  });

  // Serve static files from the .next directory
  app.use('/_next', express.static(path.join(__dirname, '.next/static'), {
    maxAge: '1y'
  }));
  
  // Serve public files
  app.use(express.static(path.join(__dirname, 'public')));

  // Create your own handler for the home page
  app.get('/', (req, res) => {
    try {
      const htmlPath = path.join(__dirname, '.next/server/pages/index.html');
      if (fs.existsSync(htmlPath)) {
        const html = fs.readFileSync(htmlPath, 'utf8');
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
      } else {
        // If the static HTML file doesn't exist, try to proxy to Next.js
        proxyToNext(req, res);
      }
    } catch (error) {
      console.error('Error serving homepage:', error);
      res.status(500).send('Error serving homepage. Please try again in a moment.');
    }
  });

  // Proxy all other requests to Next.js
  function proxyToNext(req, res) {
    // Create a proxy for this specific request
    const proxy = createProxyMiddleware({
      target: `http://localhost:${NEXT_PORT}`,
      changeOrigin: true,
      ws: true,
      proxyTimeout: 30000,
      onError: (err, req, res) => {
        console.error(`Proxy error: ${err.message}`);
        res.writeHead(503, {
          'Content-Type': 'text/html'
        });
        res.end(`
          <html>
            <head><title>Site Loading</title></head>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
              <h1>Site is starting up</h1>
              <p>The application is still warming up. Please try refreshing in a few seconds.</p>
              <script>
                // Auto refresh after 5 seconds
                setTimeout(() => { window.location.reload(); }, 5000);
              </script>
            </body>
          </html>
        `);
      }
    });
    
    proxy(req, res);
  }

  // Use the proxy for all other routes
  app.use('*', (req, res) => {
    proxyToNext(req, res);
  });

  // Start listening on the Render port
  const server = app.listen(RENDER_PORT, '0.0.0.0', () => {
    console.log(`Express server listening on port ${RENDER_PORT} -> forwarding to ${NEXT_PORT}`);
  });

  server.on('error', (error) => {
    console.error(`Server error: ${error.message}`);
  });

  return server;
};

// Start the Next.js standalone server
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
  });

  return server;
};

// Main execution
const main = async () => {
  try {
    // Start Next.js server
    startNextServer();
    
    // Give Next.js a moment to start before creating our proxy server
    setTimeout(() => {
      console.log('Setting up Express server to handle requests...');
      createServer();
    }, 5000);
    
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
};

main();