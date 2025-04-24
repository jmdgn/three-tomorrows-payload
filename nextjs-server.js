import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

console.log('Starting Next.js server (without Payload)...');
console.log('Current directory:', process.cwd());

// Explore the Next.js output structure
const nextDir = path.join(__dirname, '.next');
console.log('Exploring Next.js output structure:');
if (fs.existsSync(nextDir)) {
  // List top-level directories in .next
  const nextContents = fs.readdirSync(nextDir);
  console.log('.next directory contains:', nextContents);
  
  // Check for standalone directory
  if (nextContents.includes('standalone')) {
    console.log('Found standalone directory structure:');
    const standaloneContents = fs.readdirSync(path.join(nextDir, 'standalone'));
    console.log('standalone contains:', standaloneContents);
  }
  
  // Check for server directory
  if (nextContents.includes('server')) {
    console.log('Found server directory structure:');
    const serverContents = fs.readdirSync(path.join(nextDir, 'server'));
    console.log('server contains:', serverContents);
  }
} else {
  console.log('No .next directory found.');
}

// Serve static files
app.use('/_next', express.static(path.join(__dirname, '.next/static')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Always show a welcome page
app.get('*', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Next.js App on Render</title>
        <style>
          body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          pre { background: #f5f5f5; padding: 10px; border-radius: 5px; overflow: auto; }
        </style>
      </head>
      <body>
        <h1>Next.js Server is Running</h1>
        <p>This is a temporary page to help diagnose the Next.js setup.</p>
        <p>Requested path: ${req.path}</p>
        <p>We need to inspect the Next.js output structure to correctly serve your application.</p>
        <p>Once we understand the structure, we'll update the server to properly serve your pages.</p>
      </body>
    </html>
  `);
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});