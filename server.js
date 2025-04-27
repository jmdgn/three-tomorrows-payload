import express from 'express'
import payload from 'payload'
import next from 'next'
import { buildConfig } from './src/payload.config.ts'

console.log('Environment:', process.env.NODE_ENV)
console.log('PORT environment variable:', process.env.PORT)
console.log('NEXT_PUBLIC_SERVER_URL:', process.env.NEXT_PUBLIC_SERVER_URL)
console.log('PAYLOAD_PUBLIC_SERVER_URL:', process.env.PAYLOAD_PUBLIC_SERVER_URL)

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
      config: buildConfig,
      onInit: () => {
        console.log(
          'Payload CMS initialized successfully with URL:',
          process.env.PAYLOAD_PUBLIC_SERVER_URL,
        )
      },
    })

    server.get('/health', (req, res) => {
      res.status(200).send('OK')
    })

    server.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', 'https://threetomorrows.co')
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
      res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization',
      )

      if (req.method === 'OPTIONS') {
        return res.status(200).end()
      }

      next()
    })

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
