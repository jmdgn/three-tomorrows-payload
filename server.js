const express = require('express');
const next = require('next');
const payload = require('payload');
const dotenv = require('dotenv');

dotenv.config();

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();
const PORT = process.env.PORT || 3000;

const start = async () => {
  const server = express();

  await nextApp.prepare();

  // Initialize Payload
  await payload.init({
    secret: process.env.PAYLOAD_SECRET,
    mongoURL: process.env.MONGODB_URI,
    express: server,
    onInit: () => {
      console.log('🚀 Payload Admin URL:', payload.getAdminURL());
    },
  });

  // Let Next handle all other routes
  server.all('*', (req, res) => handle(req, res));

  server.listen(PORT, () => {
    console.log(`✅ Server is ready at http://localhost:${PORT}`);
  });
};

start();
