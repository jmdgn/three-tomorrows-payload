import express from 'express';
import next from 'next';
import payload from 'payload';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Debug environmental variables
console.log('Environment check:');
console.log('PAYLOAD_SECRET:', process.env.PAYLOAD_SECRET); // Print actual value for debugging
console.log('DATABASE_URI exists:', Boolean(process.env.DATABASE_URI));
console.log('Current directory:', process.cwd());

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();
const PORT = process.env.PORT || 3000;

// Set a fallback secret if environment variable is missing
const PAYLOAD_SECRET = process.env.PAYLOAD_SECRET || 'a-temporary-fallback-secret-for-render-deployment';

const start = async () => {
  try {
    const server = express();

    await nextApp.prepare();

    // Initialize Payload with explicit secret
    await payload.init({
      secret: PAYLOAD_SECRET,
      mongoURL: process.env.DATABASE_URI,
      express: server,
      config: path.resolve(__dirname, './src/payload.config.ts'),
      onInit: () => {
        console.log('🚀 Payload Admin URL:', payload.getAdminURL());
      },
    });

    // Let Next handle all other routes
    server.all('*', (req, res) => handle(req, res));

    server.listen(PORT, () => {
      console.log(`✅ Server is ready at http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('Server startup error:', error);
    // Print the full error details for debugging
    console.error(JSON.stringify(error, null, 2));
  }
};

start().catch(error => {
  console.error('Failed to start the server:', error);
});