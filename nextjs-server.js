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
app.use('/public', express.static(path.join(__dirname, 'public')));

// Check if the server directory exists
const pagesDir = path.join(__dirname, '.next/server/pages');
if (fs.existsSync(pagesDir)) {
  console.log('Found Next.js pages directory. Setting up page routing.');
  
  // Handle Next.js pages manually instead of importing the standalone server
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '.next/server/pages/index.html'));
  });
  
  // Fallback for all other routes
  app.get('*', (req, res) => {
    res.send('<h1>Next.js Page</h1><p>This would be a Next.js page in production.</p>');
  });
} else {
  console.log('No Next.js pages directory found. Using fallback mode.');
  // Simple fallback if no Next.js build
  app.get('/', (req, res) => {
    res.send('<h1>Next.js Not Available</h1><p>The Next.js build was not found.</p>');
  });
}

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});