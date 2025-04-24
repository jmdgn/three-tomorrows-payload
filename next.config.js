import { withPayload } from '@payloadcms/next/withPayload'
import redirects from './redirects.js'

// Determine if we're in build mode
const isBuild = process.env.NEXT_PUBLIC_IS_BUILD === 'true'

const NEXT_PUBLIC_SERVER_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Disable image optimization during build to reduce errors
    unoptimized: isBuild,
    remotePatterns: isBuild 
      ? [] // Skip remote patterns during build
      : [...[NEXT_PUBLIC_SERVER_URL]
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
  redirects: isBuild ? async () => [] : redirects, // Skip redirects during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: 'standalone',
  env: {
    PORT: process.env.PORT || '3000',
    PAYLOAD_SECRET: process.env.PAYLOAD_SECRET || 'temp-build-secret',
    DATABASE_URI: process.env.DATABASE_URI || 'mongodb://localhost:27017/temp-db',
    MONGODB_URI: process.env.MONGODB_URI || process.env.DATABASE_URI || 'mongodb://localhost:27017/temp-db',
    NEXT_PUBLIC_SERVER_URL,
    // Add the build flag to the environment
    NEXT_PUBLIC_IS_BUILD: isBuild ? 'true' : '',
  },
  // Additional optimizations for build
  experimental: {
    // Reduce resource usage during build
    cpus: isBuild ? 1 : undefined,
    // Skip optimization during build
    optimizeCss: !isBuild,
  },
  // Custom webpack config for build
  webpack: (config, { isServer, dev }) => {
    // Add fallbacks for node modules that might cause issues during build
    if (isBuild) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
      }
      
      // Skip certain modules during build
      if (isServer) {
        config.externals = [...(config.externals || []), 'mongodb', 'mongoose']
      }
    }
    
    return config
  },
}

// Different Payload config for build vs runtime
const payloadOptions = isBuild 
  ? {
      // Minimal config for build
      devBundleServerPackages: false,
      // Skip actual payload initialization during build
      disablePayloadMiddleware: true,
      payloadConfig: {
        env: {
          ...process.env,
          PAYLOAD_CONFIG_PATH: undefined, // Skip config loading during build
        }
      }
    }
  : {
      // Normal config for runtime
      devBundleServerPackages: false,
      payloadConfig: {
        env: process.env
      }
    }

export default withPayload(nextConfig, payloadOptions)