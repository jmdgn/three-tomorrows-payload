import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Render expects port 10000
const RENDER_PORT = process.env.PORT || 10000;
// Use a different port for the internal Next.js server
const NEXT_PORT = 3000;

console.log(`Render expects port: ${RENDER_PORT}`);
console.log(`Next.js is using port: ${NEXT_PORT}`);

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

  // Set up the proxy to forward to the Next.js server
  app.use('/', createProxyMiddleware({
    target: `http://localhost:${NEXT_PORT}`,
    changeOrigin: true,
    ws: true,
    logLevel: 'debug'
  }));

  // Start listening on the Render port
  app.listen(RENDER_PORT, '0.0.0.0', () => {
    console.log(`Proxy server listening on port ${RENDER_PORT} -> forwarding to ${NEXT_PORT}`);
  });
};

// Start both servers
const nextServer = startNextServer();
// Wait a bit for Next.js to start
setTimeout(() => {
  createProxyServer();
}, 3000);