import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Get the PORT from environment variables (Render sets this)
const RENDER_PORT = process.env.PORT || 3000;
// Next.js standalone seems to use port 10000 internally
const NEXT_PORT = 10000;

console.log(`Render expects port: ${RENDER_PORT}`);
console.log(`Next.js is using port: ${NEXT_PORT}`);

// Start the Next.js standalone server
const startNextServer = () => {
  console.log(`Starting Next.js standalone server on internal port: ${NEXT_PORT}`);

  const server = spawn('node', ['.next/standalone/server.js'], {
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

  // Set up the proxy to forward to the Next.js server
  app.use('/', createProxyMiddleware({
    target: `http://localhost:${NEXT_PORT}`,
    changeOrigin: true,
    ws: true,
    logLevel: 'debug'
  }));

  // Start listening on the Render port
  app.listen(RENDER_PORT, () => {
    console.log(`Proxy server listening on port ${RENDER_PORT} -> forwarding to ${NEXT_PORT}`);
  });
};

// Start both servers
const nextServer = startNextServer();
createProxyServer();