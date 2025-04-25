// server.js
import express from 'express'
import payload from 'payload'
import next from 'next'
// Import the Payload configuration
import { buildConfig } from './src/payload.config.ts'

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const server = express()

;(async () => {
  await app.prepare()

  await payload.init({
    secret: process.env.PAYLOAD_SECRET,
    express: server,
    config: buildConfig, // Use the buildConfig function from the config file
  })

  // Let Next.js handle all other routes
  server.all('*', (req, res) => handle(req, res))

  const port = process.env.PORT || 3000
  server.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`)
  })
})()
