import express from 'express';
import payload from 'payload';
import next from 'next';
import path from 'path';
import { fileURLToPath } from 'url';

// Get environment variables
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Create Express server
const server = express();

// Add health check endpoint for Render.com
server.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Check required environment variables at runtime
function checkRequiredEnvVars() {
  if (process.env.NODE_ENV === 'production') {
    const required = ['PAYLOAD_SECRET', 'DATABASE_URI', 'MONGODB_URI'];
    const missing = required.filter(varName => 
      !process.env[varName] && 
      // Special handling for DATABASE_URI and MONGODB_URI - only need one of them
      !(varName === 'DATABASE_URI' && process.env.MONGODB_URI) && 
      !(varName === 'MONGODB_URI' && process.env.DATABASE_URI)
    );
    
    if (missing.length > 0) {
      console.error(`Missing required environment variables: ${missing.join(', ')}`);
      console.error('Please set these variables before starting the server.');
      return false;
    }
  }
  return true;
}

// Handle graceful shutdown
function setupGracefulShutdown(server) {
  const signals = ['SIGINT', 'SIGTERM'];
  signals.forEach(signal => {
    process.on(signal, () => {
      console.log(`Received ${signal}, shutting down gracefully`);
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });
  });
}

// Start the server
(async () => {
  try {
    // Check environment variables
    if (!checkRequiredEnvVars()) {
      process.exit(1);
    }

    // Prepare Next.js
    await app.prepare();

    // Initialize Payload in production or development
    // In production, make sure PAYLOAD_SECRET and DATABASE_URI or MONGODB_URI are set
    if (process.env.NODE_ENV !== 'production' || 
        (process.env.PAYLOAD_SECRET && (process.env.DATABASE_URI || process.env.MONGODB_URI))) {
      
      // Get the dirname for ESM
      const __dirname = path.dirname(fileURLToPath(import.meta.url));
      
      await payload.init({
        secret: process.env.PAYLOAD_SECRET,
        express: server,
        configPath: path.resolve(__dirname, './payload.config.js'),
        onInit: () => {
          console.log('Payload initialized');
        },
      });
    } else {
      console.log('Skipping Payload initialization (missing environment variables)');
    }

    // Handle all other routes with Next.js
    server.all('*', (req, res) => {
      return handle(req, res);
    });

    // Start listening on the appropriate port
    const port = process.env.PORT || 3000;
    const httpServer = server.listen(port, '0.0.0.0', () => {
      console.log(`Server running at http://0.0.0.0:${port}`);
    });

    // Handle graceful shutdown
    setupGracefulShutdown(httpServer);
    
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
})();