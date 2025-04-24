import express from 'express';
import payload from 'payload';
import next from 'next';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get the dirname for ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Environment variables
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Create Express server
const server = express();

// Simple file-based health check that doesn't require database
server.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('UNHANDLED REJECTION:', error);
});

// Start the server
(async () => {
  try {
    // Prepare Next.js
    await app.prepare();
    
    // Add payload only after Next.js is ready
    try {
      // Initialize Payload CMS
      await payload.init({
        secret: process.env.PAYLOAD_SECRET || 'fallback-secret-not-for-production',
        express: server,
        onInit: () => {
          console.log('✅ Payload initialized successfully');
        },
      });
    } catch (payloadError) {
      console.error('Failed to initialize Payload:', payloadError);
      
      // Even if Payload fails, we can still serve the Next.js app
      console.log('Continuing to serve Next.js application without Payload...');
    }

    // Handle Next.js requests
    server.all('*', (req, res) => {
      return handle(req, res);
    });

    // Start the server
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running at http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
})();