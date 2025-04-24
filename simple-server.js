import express from 'express';
import payload from 'payload';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Hardcode the secret directly
const HARDCODED_SECRET = 'this-is-a-fixed-secret-key-for-testing';

console.log('Starting simple server with hardcoded secret');

payload.init({
  secret: HARDCODED_SECRET, // Use completely hardcoded string
  mongoURL: process.env.DATABASE_URI,
  express: app,
  onInit: () => {
    console.log('Payload initialized successfully');
    
    // Add a simple route to test
    app.get('/', (req, res) => {
      res.send('Server is running! Payload initialized successfully.');
    });
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  },
}).catch(error => {
  console.error('Failed to initialize Payload:', error);
});