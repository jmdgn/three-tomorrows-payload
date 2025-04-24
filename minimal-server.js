import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

console.log('Starting minimal server...');
console.log('Current directory:', process.cwd());
console.log('__dirname:', __dirname);

// Serve static files from .next/static
app.use('/_next', express.static(path.join(__dirname, '.next/static')));

// This route will at least confirm our server is running
app.get('/', (req, res) => {
  res.send('<h1>Server is running!</h1><p>This is a temporary page to confirm the server is working.</p>');
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});