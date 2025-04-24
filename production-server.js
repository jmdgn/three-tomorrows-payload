// production-server.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
import { execSync } from 'child_process';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 10000;

console.log('Starting production server...');
console.log('Current directory:', process.cwd());

// Serve some static files directly
app.use('/_next', express.static(path.join(__dirname, '.next/static')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Function to start the standalone Next.js app as a separate process
const startNextJsApp = () => {
  const standaloneDir = path.join(__dirname, '.next/standalone');
  
  console.log('Starting Next.js standalone server from:', standaloneDir);
  
  // Prepare environment variables for the child process
  const env = {
    ...process.env,
    PORT: 3000, // Use a different port internally
    NODE_ENV: 'production',
  };
  
  // Spawn the server.js process
  const nextProcess = spawn('node', ['server.js'], {
    cwd: standaloneDir,
    env,
    stdio: 'pipe', // Pipe logs for monitoring
  });
  
  // Handle process output
  nextProcess.stdout.on('data', (data) => {
    console.log(`Next.js: ${data}`);
  });
  
  nextProcess.stderr.on('data', (data) => {
    console.error(`Next.js error: ${data}`);
  });
  
  nextProcess.on('close', (code) => {
    console.log(`Next.js process exited with code ${code}`);
    // Restart the process after a delay if it crashes
    setTimeout(startNextJsApp, 5000);
  });
  
  return nextProcess;
};

// Create a proxy to the Next.js app
const setupProxy = () => {
  // Proxy all requests to the Next.js app
  app.use('/', createProxyMiddleware({
    target: 'http://localhost:3000',
    changeOrigin: true,
    logLevel: 'debug',
    onError: (err, req, res) => {
      console.error('Proxy error:', err);
      res.writeHead(502, {
        'Content-Type': 'text/html',
      });
      res.end(`
        <html>
          <head>
            <title>Service Temporarily Unavailable</title>
            <style>
              body { font-family: system-ui, sans-serif; max-width: 800px; margin: 60px auto; padding: 20px; }
              h1 { color: #333; }
              .message { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <h1>Service Temporarily Unavailable</h1>
            <div class="message">
              <p>The application server is currently starting up. Please refresh in a few moments.</p>
            </div>
          </body>
        </html>
      `);
    },
  }));
};

try {
  // Make sure http-proxy-middleware is installed
  console.log('Setting up proxy...');
  setupProxy();
  
  // Start the Next.js app
  const nextApp = startNextJsApp();
  
  // Start the main server
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Main server running on port ${PORT}`);
    console.log(`Proxying requests to Next.js app on port 3000`);
    console.log(`View your site at: http://localhost:${PORT}`);
  });
  
  // Handle cleanup when the main process exits
  process.on('SIGINT', () => {
    console.log('Shutting down...');
    if (nextApp) {
      nextApp.kill();
    }
    process.exit();
  });
} catch (error) {
  console.error('Error setting up server:', error);
  console.log('Installing missing dependencies...');
  try {
    execSync('npm install http-proxy-middleware', { stdio: 'inherit' });
    console.log('Dependency installed. Please restart the server.');
  } catch (installError) {
    console.error('Failed to install dependency:', installError);
  }
}