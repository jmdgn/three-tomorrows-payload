// server.js
import express from 'express'
import payload from 'payload'
import next from 'next'
// Import the Payload configuration
import { buildConfig } from './src/payload.config.ts'

// Add detailed environment logging
console.log('Environment:', process.env.NODE_ENV)
console.log('PORT environment variable:', process.env.PORT)
console.log('Server URL:', process.env.NEXT_PUBLIC_SERVER_URL)

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const server = express()

;(async () => {
  try {
    console.log('Preparing Next.js app...')
    await app.prepare()
    console.log('Next.js app prepared successfully')

    console.log('Initializing Payload CMS...')
    await payload.init({
      secret: process.env.PAYLOAD_SECRET,
      express: server,
      config: buildConfig, // Use the buildConfig function from the config file
    })
    console.log('Payload CMS initialized successfully')

    // Add a health check endpoint
    server.get('/health', (req, res) => {
      res.status(200).send('OK')
    })

    // Let Next.js handle all other routes
    server.all('*', (req, res) => handle(req, res))

    const port = process.env.PORT || 3000
    server.listen(port, '0.0.0.0', () => {
      console.log(`Server running at http://0.0.0.0:${port}`)
      console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set (value hidden)' : 'Not set')
      console.log('DATABASE_URI:', process.env.DATABASE_URI ? 'Set (value hidden)' : 'Not set')
      console.log('Payload Secret:', process.env.PAYLOAD_SECRET ? 'Set (value hidden)' : 'Not set')
    })
  } catch (error) {
    console.error('Server startup error:', error)
  }
})()
