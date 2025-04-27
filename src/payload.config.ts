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

import { s3Storage } from '@payloadcms/storage-s3'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

let storageOptions = {}
if (
  process.env.AWS_BUCKET_NAME &&
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY
) {
  console.log('Configuring S3 storage with bucket:', process.env.AWS_BUCKET_NAME)

  storageOptions = {
    s3: s3Storage({
      bucket: process.env.AWS_BUCKET_NAME,
      config: {
        region: process.env.AWS_REGION || 'ap-southeast-2',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      },
      collections: {
        media: {
          prefix: 'media',
        },
      },
      acl: 'public-read',
    }),
  }
} else {
  console.warn('AWS credentials not found - using local file storage')
}

const serverURL =
  process.env.RAILWAY_STATIC_URL ||
  process.env.PAYLOAD_PUBLIC_SERVER_URL ||
  process.env.NEXT_PUBLIC_SERVER_URL ||
  'http://localhost:3000'

console.log('Configuring server with URL:', serverURL)

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
        { label: 'Mobile', name: 'mobile', width: 375, height: 667 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },

  editor: defaultLexical,

  db: mongooseAdapter({
    url: process.env.DATABASE_URI || process.env.MONGODB_URI,
  }),

  collections: [Pages, Posts, Media, Categories, Services, Users, Subscribers, Homepage],

  cors: [
    process.env.NEXT_PUBLIC_SERVER_URL,
    process.env.PAYLOAD_PUBLIC_SERVER_URL,
    'http://localhost:3000',
  ].filter(Boolean),

  globals: [Header, Footer],

  plugins: [...(storageOptions.s3 ? [storageOptions.s3] : []), ...plugins],

  serverURL,

  upload: {
    limits: {
      fileSize: 10000000, // 10MB
    },
  },

  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

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
