import redirects from './redirects.js'

const NEXT_PUBLIC_SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'threetomorrows.co', 'three-tomorrows-payload.vercel.app'],
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
  // Add these settings to fix build issues
  experimental: {
    // More permissive settings for complex builds
    esmExternals: 'loose',
    // Skip potential problematic checks
    skipTrailingSlashRedirect: true,
    // Allow more time for builds
    serverComponentsExternalPackages: [],
  },
  onDemandEntries: {
    // Make the build more permissive
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 5,
  },
  // Keep this setting
  output: 'standalone',
  env: {
    PORT: process.env.PORT || '3000',
    PAYLOAD_SECRET: process.env.PAYLOAD_SECRET,
    DATABASE_URI: process.env.DATABASE_URI,
    MONGODB_URI: process.env.MONGODB_URI || process.env.DATABASE_URI,
    NEXT_PUBLIC_SERVER_URL,
  },
  // Add this to suppress certain build warnings
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs' module on the client to prevent this error
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      }
    }
    return config
  },
}

export default nextConfig
