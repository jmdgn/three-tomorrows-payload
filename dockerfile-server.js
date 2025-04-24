import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import payload from 'payload';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

const app = express();

// Add a simple health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

const start = async () => {
  try {
    // Initialize Payload
    await payload.init({
      secret: process.env.PAYLOAD_SECRET || 'temporary-fallback-secret-key',
      mongoURL: process.env.DATABASE_URI,
      express: app,
      onInit: () => {
        console.log('Payload initialized');
      },
    });

    // Serve Next.js standalone app
    app.use(express.static(path.join(__dirname, 'public')));
    app.use('/_next', express.static(path.join(__dirname, '.next/static')));

    // Handle all other routes with Next.js
    app.all('*', (req, res) => {
      try {
        // If this is a Payload admin route, let Payload handle it
        if (req.url.startsWith('/admin') || req.url.startsWith('/api')) {
          return payload.express.handle(req, res);
        }

        // Otherwise serve the Next.js frontend
        res.sendFile(path.join(__dirname, '.next/server/pages', req.url === '/' ? 'index.html' : `${req.url}.html`));
      } catch (error) {
        console.error('Route handling error:', error);
        res.status(500).send('Server Error');
      }
    });

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup error:', error);
  }
};

start();