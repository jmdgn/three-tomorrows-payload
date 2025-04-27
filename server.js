import express from 'express'
import payload from 'payload'
import next from 'next'
import { buildConfig } from './src/payload.config.ts'

function ensureUrlHasProtocol(url) {
  if (!url) return 'https://three-tomorrows-payload-production.up.railway.app'

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`
  }

  return url
}

const rawProductionUrl =
  process.env.RAILWAY_STATIC_URL ||
  process.env.RAILWAY_PUBLIC_URL ||
  process.env.PAYLOAD_PUBLIC_SERVER_URL ||
  process.env.NEXT_PUBLIC_SERVER_URL

const productionUrl = ensureUrlHasProtocol(rawProductionUrl)

if (process.env.NODE_ENV === 'production' && productionUrl) {
  process.env.NEXT_PUBLIC_SERVER_URL = productionUrl
  process.env.PAYLOAD_PUBLIC_SERVER_URL = productionUrl
  console.log('Production mode: Server URL set to', productionUrl)
} else {
  console.log('Development mode: Using existing server URLs')
}

console.log('Environment:', process.env.NODE_ENV)
console.log('PORT environment variable:', process.env.PORT)
console.log('NEXT_PUBLIC_SERVER_URL:', process.env.NEXT_PUBLIC_SERVER_URL)
console.log('PAYLOAD_PUBLIC_SERVER_URL:', process.env.PAYLOAD_PUBLIC_SERVER_URL)
console.log('RAILWAY_STATIC_URL:', process.env.RAILWAY_STATIC_URL)
console.log('RAILWAY_PUBLIC_URL:', process.env.RAILWAY_PUBLIC_URL)

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
      if (req.path.includes('media') || req.path.includes('api') || req.path === '/') {
        console.log('Request path:', req.path)
        console.log('Request hostname:', req.hostname)
        console.log('Request headers origin:', req.headers.origin)
        console.log('Request headers referer:', req.headers.referer)
      }
      next()
    })

    server.use((req, res, next) => {
      const allowedOrigins = [
        'https://threetomorrows.co',
        'https://threetomorrows.com',
        'https://www.threetomorrows.co',
        productionUrl,
      ]
      const origin = req.headers.origin

      if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin)
      } else {
        res.header('Access-Control-Allow-Origin', '*')
      }

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

    server.get('/debug-env', (req, res) => {
      res.json({
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL,
        PAYLOAD_PUBLIC_SERVER_URL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
        RAILWAY_PUBLIC_URL: process.env.RAILWAY_PUBLIC_URL,
        RAILWAY_STATIC_URL: process.env.RAILWAY_STATIC_URL,
      })
    })

    server.get('/debug-url', (req, res) => {
      const urlsToTest = [
        'threetomorrows.co',
        'https://threetomorrows.co',
        process.env.NEXT_PUBLIC_SERVER_URL,
        process.env.PAYLOAD_PUBLIC_SERVER_URL,
        productionUrl,
      ]

      const results = urlsToTest.map((url) => {
        try {
          const withProtocol = ensureUrlHasProtocol(url)
          const parsed = new URL(withProtocol)
          return {
            url,
            withProtocol,
            success: true,
            parsed: parsed.toString(),
          }
        } catch (e) {
          return {
            url,
            withProtocol: ensureUrlHasProtocol(url),
            success: false,
            error: e.message,
          }
        }
      })

      res.json(results)
    })

    server.get('/debug-media', (req, res) => {
      const mediaPath = req.query.path
      if (!mediaPath) {
        return res.status(400).json({ error: 'Please provide a path query parameter' })
      }

      const baseS3Url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-southeast-2'}.amazonaws.com`

      const possiblePaths = [
        `${baseS3Url}/${mediaPath}`,
        `${baseS3Url}/media/${mediaPath}`,
        `${process.env.NEXT_PUBLIC_SERVER_URL}/media/${mediaPath}`,
        `/media/${mediaPath}`,
      ]

      res.json({
        mediaPath,
        baseS3Url,
        possiblePaths,
        awsBucket: process.env.AWS_BUCKET_NAME,
        awsRegion: process.env.AWS_REGION,
      })
    })

    // Error handling middleware
    server.use((err, req, res, next) => {
      console.error('Server error:', err)
      res.status(500).json({ error: 'Internal server error', message: err.message })
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
