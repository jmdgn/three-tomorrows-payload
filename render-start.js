import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RENDER_PORT = process.env.PORT || 10000;

console.log(`Starting simple Express server on port ${RENDER_PORT}`);

// Create express app
const app = express();

// Serve the public directory for static assets
app.use(express.static(path.join(__dirname, 'public')));

// Serve a simple placeholder page
app.get('*', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Three Tomorrows - Coming Soon</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 50px;
            background-color: #f4f4f4;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          h1 {
            color: #333;
          }
          p {
            font-size: 18px;
            line-height: 1.6;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Three Tomorrows</h1>
          <p>Our website is currently being set up.</p>
          <p>Please check back soon!</p>
          <p><small>Deployed on Render.com</small></p>
        </div>
      </body>
    </html>
  `);
});

// Start the server
app.listen(RENDER_PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${RENDER_PORT}`);
});