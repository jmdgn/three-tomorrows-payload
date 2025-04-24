import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

console.log('Starting Next.js server (without Payload)...');
console.log('Current directory:', process.cwd());

// Serve static files
app.use('/_next', express.static(path.join(__dirname, '.next/static')));
app.use('/static', express.static(path.join(__dirname, 'public')));

// Check if the standalone output exists
const standaloneDir = path.join(__dirname, '.next/standalone');
if (fs.existsSync(standaloneDir)) {
  console.log('Found standalone directory. Using Next.js standalone output.');
  
  // Import the standalone server handler
  import('./.next/standalone/server.js')
    .then(module => {
      console.log('Successfully imported standalone server');
      // Let Next.js handle all routes
      app.all('*', (req, res) => {
        module.default(req, res);
      });
    })
    .catch(error => {
      console.error('Failed to import standalone server:', error);
      // Fallback route in case Next.js handler fails
      app.get('/', (req, res) => {
        res.send('<h1>Next.js Handler Error</h1><p>Could not load the Next.js application.</p>');
      });
    });
} else {
  console.log('No standalone directory found. Using fallback mode.');
  // Simple fallback if no Next.js standalone build
  app.get('/', (req, res) => {
    res.send('<h1>Next.js Not Available</h1><p>The Next.js standalone build was not found.</p>');
  });
}

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});