import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import payload from 'payload';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

// Debug environment variables
console.log('Environment debug:');
console.log('PAYLOAD_SECRET:', process.env.PAYLOAD_SECRET ? 'exists with length ' + process.env.PAYLOAD_SECRET.length : 'missing');
console.log('DATABASE_URI:', process.env.DATABASE_URI ? 'exists with length ' + process.env.DATABASE_URI.length : 'missing');

// Define a guaranteed secret
const PAYLOAD_SECRET = process.env.PAYLOAD_SECRET || 'd913b0d6b1c2d47b6ba9b59a';

const app = express();

// Initialize Payload first
const init = async () => {
  try {
    console.log('Initializing Payload with secret key of length:', PAYLOAD_SECRET.length);
    
    await payload.init({
      secret: PAYLOAD_SECRET,
      mongoURL: process.env.DATABASE_URI,
      express: app,
      config: path.resolve(__dirname, './src/payload.config.ts'),
      onInit: () => {
        console.log('🚀 Payload initialized successfully');
      },
    });
    
    console.log('Setting up static file serving...');
    
    // Set up static file serving for Next.js
    app.use('/_next', express.static(path.join(__dirname, '.next/static')));
    app.use('/static', express.static(path.join(__dirname, 'public')));
    
    // For all other routes, use Next.js app
    app.all('*', (req, res) => {
      try {
        // Import the Next.js handler
        console.log('Handling request:', req.url);
        const nextHandler = require('./.next/server/app/route.js');
        return nextHandler(req, res);
      } catch (error) {
        console.error('Error handling request with Next.js:', error);
        res.status(500).send('Internal Server Error - Next.js handler failed');
      }
    });

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server successfully started on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize server:', error);
    console.error(JSON.stringify(error, null, 2));
  }
};

init().catch(error => {
  console.error('Unhandled error during initialization:', error);
});