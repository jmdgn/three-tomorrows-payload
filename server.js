import express from 'express';
import payload from 'payload';
import next from 'next';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Set up environment
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const server = express();

// Create a health check endpoint
server.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling for the entire application
process.on('unhandledRejection', (error) => {
  console.error('UNHANDLED REJECTION:', error);
});

process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION:', error);
});

// Start the server
(async () => {
  try {
    // Prepare Next.js first
    console.log('Preparing Next.js...');
    await app.prepare();
    
    // Initialize Payload CMS with error handling
    try {
      console.log('Initializing Payload CMS...');
      await payload.init({
        secret: process.env.PAYLOAD_SECRET || 'default-secret-for-testing-only',
        express: server,
        onInit: () => {
          console.log('✅ Payload initialized');
        },
      });
    } catch (error) {
      console.error('⚠️ Error initializing Payload:', error);
      console.log('Continuing to serve Next.js application despite Payload initialization failure');
    }

    // Set up Next.js handler for all routes
    server.all('*', (req, res) => {
      return handle(req, res);
    });

    // Start listening
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('Fatal server error:', error);
    process.exit(1);
  }
})();