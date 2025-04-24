// server.ts
import express from 'express';
import payload from 'payload';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const server = express();

(async () => {
  await app.prepare();

  await payload.init({
    secret: process.env.PAYLOAD_SECRET,
    express: server,
  });

  // Let Next.js handle all other routes
  server.all('*', (req, res) => handle(req, res));

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
})();