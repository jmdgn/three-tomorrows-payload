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

// Check if we're in build mode
const isBuild = process.env.NEXT_PUBLIC_IS_BUILD === 'true'

// Create a mock DB adapter for build time
const createMockDBAdapter = () => {
  return {
    connect: async () => {
      console.log('Using mock database adapter for build');
      return Promise.resolve();
    },
    find: async () => ({ docs: [], hasNextPage: false, hasPrevPage: false, limit: 10, nextPage: null, page: 1, pagingCounter: 1, prevPage: null, totalDocs: 0, totalPages: 0 }),
    findOne: async () => null,
    create: async () => ({}),
    update: async () => ({}),
    delete: async () => ({}),
    // Add other required methods as needed
  };
};

export default buildConfig({
  admin: {
    components: {
      // During build, use simplified components
      ...(isBuild ? {} : {
        beforeLogin: ['@/components/BeforeLogin'],
        beforeDashboard: ['@/components/BeforeDashboard'],
        Dashboard: path.resolve(dirname, 'components/CustomHomepage'),
        views: {
          Subscribers: path.resolve(dirname, 'components/Subscribers/SubscribersDashboard'),
        }
      })
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
    livePreview: isBuild ? undefined : {
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
  // Decide which DB adapter to use based on build vs runtime
  db: isBuild 
    ? {
        // During build, use an in-memory mock to avoid any real connections
        mongodb: {
          url: 'mongodb://mock:27017/mock-db',
        }
      }
    : mongooseAdapter({
        url: process.env.DATABASE_URI || process.env.MONGODB_URI || '',
      }),
  collections: [Pages, Posts, Media, Categories, Services, Users, Subscribers, Homepage],
  cors: isBuild ? ['*'] : [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer],
  // During build, use minimal plugins
  plugins: isBuild ? [] : [...plugins],
  secret: process.env.PAYLOAD_SECRET || 'temp-secret-for-build-only',
  // Only use sharp at runtime to avoid unnecessary processing during build
  ...(isBuild ? {} : { sharp }),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // Disable all optional features during build
  rateLimit: !isBuild,
  csrf: !isBuild,
  telemetry: false,
  // Only enable jobs at runtime
  jobs: isBuild ? undefined : {
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