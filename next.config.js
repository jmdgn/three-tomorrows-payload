import redirects from './redirects.js'

const RAILWAY_STATIC_URL = process.env.RAILWAY_STATIC_URL
const RAILWAY_PUBLIC_URL = process.env.RAILWAY_PUBLIC_URL
const NEXT_PUBLIC_SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

let serverUrl = RAILWAY_STATIC_URL || RAILWAY_PUBLIC_URL || NEXT_PUBLIC_SERVER_URL

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
    PAYLOAD_PUBLIC_SERVER_URL: serverUrl,
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

export default nextConfig
