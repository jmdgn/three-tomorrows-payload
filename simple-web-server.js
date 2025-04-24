import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 10000;

console.log('Starting simple web server...');
console.log('Current directory:', process.cwd());

// Serve static files
app.use('/_next', express.static(path.join(__dirname, '.next/static')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Create a simple home page
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Next.js Payload Site</title>
        <style>
          body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
          .container { background: #f9f9f9; border-radius: 8px; padding: 20px; margin-top: 20px; }
          h1 { color: #333; }
          .button { display: inline-block; background: #0070f3; color: white; text-decoration: none; padding: 10px 20px; 
                   border-radius: 4px; font-weight: 500; margin-right: 10px; }
          .note { background: #fffde7; padding: 15px; border-left: 4px solid #ffd600; margin: 20px 0; }
        </style>
      </head>
      <body>
        <h1>Next.js + Payload CMS</h1>
        <p>Your server is running! Here's what we know:</p>
        
        <div class="container">
          <h2>Deployment Status</h2>
          <p>The server is up and running, but we're encountering some configuration issues with Payload CMS and Next.js.</p>
          <p>Common issues we identified:</p>
          <ul>
            <li>Payload CMS needs a properly configured secret key</li>
            <li>Next.js standalone server module structure may not be compatible with our import method</li>
          </ul>
        </div>
        
        <div class="note">
          <h3>Next Steps</h3>
          <p>We recommend checking your environment variables in the Render dashboard:</p>
          <ul>
            <li>Ensure PAYLOAD_SECRET is properly set</li>
            <li>Verify DATABASE_URI is correctly configured</li>
          </ul>
          <p>Once these are set up, we can create a custom server that properly initializes both Payload and Next.js.</p>
        </div>
        
        <p>
          <a href="/diagnostics" class="button">View Diagnostics</a>
        </p>
      </body>
    </html>
  `);
});

// Add a diagnostics page
app.get('/diagnostics', (req, res) => {
  // Check if .env file exists
  const hasEnvFile = fs.existsSync(path.join(__dirname, '.env'));
  
  // Check Next.js structure
  const nextDir = path.join(__dirname, '.next');
  let nextStructure = [];
  if (fs.existsSync(nextDir)) {
    nextStructure = fs.readdirSync(nextDir);
  }
  
  // Check standalone structure
  const standaloneDir = path.join(__dirname, '.next/standalone');
  let standaloneStructure = [];
  if (fs.existsSync(standaloneDir)) {
    standaloneStructure = fs.readdirSync(standaloneDir);
  }
  
  res.send(`
    <html>
      <head>
        <title>Diagnostics - Next.js Payload Site</title>
        <style>
          body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
          pre { background: #f5f5f5; padding: 15px; border-radius: 4px; overflow: auto; }
          .container { background: #f9f9f9; border-radius: 8px; padding: 20px; margin-top: 20px; }
          h1, h2 { color: #333; }
          .back { display: inline-block; margin-top: 20px; color: #0070f3; }
        </style>
      </head>
      <body>
        <h1>Deployment Diagnostics</h1>
        
        <div class="container">
          <h2>Environment</h2>
          <p>.env file present: ${hasEnvFile ? 'Yes' : 'No'}</p>
          <p>NODE_ENV: ${process.env.NODE_ENV || 'Not set'}</p>
          <p>PAYLOAD_SECRET: ${process.env.PAYLOAD_SECRET ? 'Set (length: ' + process.env.PAYLOAD_SECRET.length + ')' : 'Not set'}</p>
          <p>DATABASE_URI: ${process.env.DATABASE_URI ? 'Set (length: ' + process.env.DATABASE_URI.length + ')' : 'Not set'}</p>
        </div>
        
        <div class="container">
          <h2>Next.js Build Structure</h2>
          <pre>${JSON.stringify(nextStructure, null, 2)}</pre>
          
          <h3>Standalone Structure</h3>
          <pre>${JSON.stringify(standaloneStructure, null, 2)}</pre>
        </div>
        
        <a href="/" class="back">← Back to Home</a>
      </body>
    </html>
  `);
});

// Handle all other routes
app.get('*', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Page Not Found</title>
        <style>
          body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; text-align: center; }
          h1 { margin-top: 50px; color: #333; }
          .back { display: inline-block; margin-top: 20px; color: #0070f3; }
        </style>
      </head>
      <body>
        <h1>Page Not Found</h1>
        <p>The page you requested (${req.path}) could not be found.</p>
        <a href="/" class="back">← Back to Home</a>
      </body>
    </html>
  `);
});

// Start server on a specific port
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`View the site at: http://localhost:${PORT}`);
});