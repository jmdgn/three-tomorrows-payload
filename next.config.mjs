import redirects from './redirects.js'
import { withPayload } from '@payloadcms/next/withPayload'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// --- THIS IS THE CORRECTED LOGIC ---
// It now prioritizes your custom domain over Railway's defaults.
let serverUrl =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  process.env.RAILWAY_PUBLIC_URL ||
  process.env.RAILWAY_STATIC_URL ||
  'http://localhost:3000'

if (serverUrl && !serverUrl.startsWith('http://') && !serverUrl.startsWith('https://')) {
  serverUrl = `https://${serverUrl}`
  console.log('Added https:// protocol to server URL:', serverUrl)
}

console.log('Building with server URL:', serverUrl)

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'localhost',
      'threetomorrows.co',
      'threetomorrows.com',
      'three-tomorrows-payload.up.railway.app',
      'three-tomorrows-payload-production.up.railway.app',
      'three-tomorrows-payload.vercel.app',
      'threetomorrows-bucket.s3.ap-southeast-2.amazonaws.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
    ],
  },
  reactStrictMode: true,
  redirects,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    PORT: process.env.PORT || '3000',
    PAYLOAD_SECRET: process.env.PAYLOAD_SECRET,
    DATABASE_URI: process.env.DATABASE_URI,
    MONGODB_URI: process.env.MONGODB_URI || process.env.DATABASE_URI,
    NEXT_PUBLIC_SERVER_URL: serverUrl,
  },
  experimental: {
    esmExternals: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      }
    }

    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    }

    return config
  },
  output: 'standalone',
}

export default withPayload(nextConfig, {
  configPath: path.resolve(dirname, './payload/payload.config.ts'),
  payloadPath: path.resolve(process.cwd(), './payload/payload.ts'),
  autoInit: process.env.NODE_ENV !== 'production',
})
