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
import { TitleIntroductionBlock } from './blocks/Titles/config'

// ✅ Import cloud storage plugin and AWS SDK
import { CloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'
import aws from 'aws-sdk'

// ✅ Get __dirname
const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// ✅ Configure AWS S3
const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, // AWS Access Key ID
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // AWS Secret Key
  region: process.env.AWS_REGION || 'us-east-1', // Your AWS Region (e.g., 'us-east-1')
})

// ✅ Configure cloud storage plugin to use S3
const storage = CloudStoragePlugin({
  s3,
  bucket: process.env.AWS_BUCKET_NAME, // Your S3 bucket name
  uploadFolder: 'media/', // Folder inside the bucket to store files
  acl: 'public-read', // Set to 'public-read' or 'private' based on your needs
})

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

  db: mongooseAdapter({
    url: process.env.DATABASE_URI,
  }),

  collections: [Pages, Posts, Media, Categories, Services, Users, Subscribers, Homepage],
  cors: [process.env.PAYLOAD_URL || getServerSideURL()].filter(Boolean),
  globals: [Header, Footer],

  plugins: [storage, ...plugins],

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
