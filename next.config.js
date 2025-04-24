import { withPayload } from '@payloadcms/next/withPayload'
import redirects from './redirects.js'

const NEXT_PUBLIC_SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || `https://${process.env.HOST || 'localhost'}`

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      ...[NEXT_PUBLIC_SERVER_URL]
        .filter(Boolean)
        .map((item) => {
          try {
            const url = new URL(item)
            if (!url.hostname) {
              console.warn(`Missing hostname in URL: ${item}`)
              return null
            }
            return {
              hostname: url.hostname,
              protocol: url.protocol.replace(':', ''),
            }
          } catch (error) {
            console.warn(`Invalid URL in NEXT_PUBLIC_SERVER_URL: ${item}`)
            return null
          }
        })
        .filter(Boolean),
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
  output: 'standalone',
  env: {
    PORT: process.env.PORT || '3000',
    PAYLOAD_SECRET: process.env.PAYLOAD_SECRET,
    DATABASE_URI: process.env.DATABASE_URI,
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://jamesmills:AGKAt5Jis97CPwGY@cluster0.uhcdpi9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
    NEXT_PUBLIC_SERVER_URL
  },
  webpack: (config, { isServer }) => {
    // If we are on the server, use the correct host
    if (isServer) {
      config.resolve.alias['@payloadcms/next/withPayload'] = require.resolve('@payloadcms/next/withPayload')
    }

    return config
  },
}

export default withPayload(nextConfig, { 
  devBundleServerPackages: false,
  payloadConfig: {
    env: process.env
  }
})
