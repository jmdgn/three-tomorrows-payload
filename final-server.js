// final-server.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import payload from 'payload';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

console.log('Starting final server with Payload integration...');
console.log('Current directory:', process.cwd());

// Set a hardcoded secret for Payload
const PAYLOAD_SECRET = process.env.PAYLOAD_SECRET || 'insecure-secret-for-testing-only-change-me';

// First, initialize Payload
const initializePayload = async () => {
  try {
    await payload.init({
      secret: PAYLOAD_SECRET,
      mongoURL: process.env.DATABASE_URI,
      express: app,
      config: path.resolve(__dirname, './src/payload.config.ts'),
      onInit: () => {
        console.log('🚀 Payload initialized successfully');
      },
    });
    return true;
  } catch (error) {
    console.error('Failed to initialize Payload:', error);
    return false;
  }
};

// Set up the standalone Next.js server
const setupNextJS = async () => {
  try {
    // Serve Next.js static files
    app.use('/_next', express.static(path.join(__dirname, '.next/static')));
    
    // Try to import the standalone server
    const nextStandalonePath = path.join(__dirname, '.next/standalone/server.js');
    
    if (fs.existsSync(nextStandalonePath)) {
      console.log('Found Next.js standalone server file. Setting up...');
      
      // Create a simple middleware to catch all routes
      app.use((req, res, next) => {
        // Skip Payload admin and API routes - let Payload handle these
        if (req.path.startsWith('/admin') || req.path.startsWith('/api')) {
          return next();
        }
        
        try {
          // Dynamic import the standalone server
          import('file://' + nextStandalonePath)
            .then(module => {
              // We need to modify req.url to match what Next.js expects
              const originalUrl = req.url;
              module.default(req, res);
              // Restore original URL for any other middleware
              req.url = originalUrl;
            })
            .catch(err => {
              console.error('Error in Next.js handler:', err);
              res.status(500).send('Next.js Error');
            });
        } catch (error) {
          console.error('Failed to handle route with Next.js:', error);
          next();
        }
      });
      
      return true;
    } else {
      console.log('Could not find Next.js standalone server.');
      
      // Fallback to a simple page
      app.get('*', (req, res, next) => {
        // Skip Payload routes
        if (req.path.startsWith('/admin') || req.path.startsWith('/api')) {
          return next();
        }
        
        res.send(`
          <html>
            <head>
              <title>Next.js App on Render</title>
              <style>
                body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
              </style>
            </head>
            <body>
              <h1>Server is Running</h1>
              <p>Next.js standalone server not found, but Payload admin should be accessible at <a href="/admin">/admin</a>.</p>
            </body>
          </html>
        `);
      });
      
      return false;
    }
  } catch (error) {
    console.error('Failed to set up Next.js:', error);
    return false;
  }
};

// Start the server
const startServer = async () => {
  try {
    // First initialize Payload
    const payloadInitialized = await initializePayload();
    console.log('Payload initialization:', payloadInitialized ? 'Success' : 'Failed');
    
    // Then set up Next.js
    const nextJSSetup = await setupNextJS();
    console.log('Next.js setup:', nextJSSetup ? 'Success' : 'Using fallback');
    
    // Start listening
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`Admin URL: http://localhost:${PORT}/admin`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();