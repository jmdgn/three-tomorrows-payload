import { mongooseAdapter } from '@payloadcms/db-mongodb'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Hero } from './collections/Hero'
import { Homepage } from './collections/Homepage'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Services } from './collections/Services'
import { Subscribers } from './collections/Subscribers'
import { Users } from './collections/Users'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'

// Reconstruct __dirname in ESM
const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Determine if we're in build mode
const isBuild = process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_IS_BUILD === 'true'

export default buildConfig({
  admin: {
    components: {
      beforeLogin: ['@/components/BeforeLogin'],
      beforeDashboard: ['@/components/BeforeDashboard'],
      Dashboard: path.resolve(dirname, 'components/CustomHomepage'),
      views: {
        Subscribers: path.resolve(dirname, 'components/Subscribers/SubscribersDashboard'),
      },
    },
    nav: {
      views: [
        {
          label: 'Email Subscribers',
          view: 'Subscribers',
        },
      ],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  editor: defaultLexical,
  // Use appropriate database config based on build vs runtime
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || process.env.MONGODB_URI || '',
    // Add connect options to handle connection during build
    connectOptions: {
      // If in build mode, set a short timeout and fewer retries
      // This helps prevent hanging builds if there's no real DB
      ...(isBuild && {
        serverSelectionTimeoutMS: 2000,
        maxPoolSize: 1,
        retryWrites: false,
      }),
    },
  }),
  collections: [Pages, Posts, Media, Categories, Services, Users, Subscribers, Homepage],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer],
  plugins: [
    ...plugins,
  ],
  // Always provide a secret key
  secret: process.env.PAYLOAD_SECRET || 'temporary-build-secret-not-for-production',
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // Disable features during build that might try to connect to DB
  rateLimit: !isBuild,
  telemetry: !isBuild,
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        if (req.user) return true

        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${process.env.CRON_SECRET}`
      },
    },
    tasks: [],
  },
})