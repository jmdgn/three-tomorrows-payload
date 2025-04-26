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

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Create a custom media storage plugin
const customMediaStoragePlugin = {
  hooks: {
    beforeOperation: [
      async ({ operation, collection, req, context }) => {
        // Only handle media uploads
        if (collection.slug === 'media' && operation === 'create') {
          try {
            // Only run if file exists
            if (req.files?.file) {
              const { put } = await import('@vercel/blob')
              const file = req.files.file

              // Upload to Vercel Blob
              const blob = await put(file.name, file.data, {
                contentType: file.mimetype,
                access: 'public',
              })

              // Add the URL to the data
              context.data = context.data || {}
              context.data.url = blob.url
            }
          } catch (error) {
            console.error('Vercel Blob upload error:', error)
          }
        }

        // Handle delete for media
        if (collection.slug === 'media' && operation === 'delete') {
          try {
            const { del } = await import('@vercel/blob')

            // Get the filename from the document being deleted
            const docToDelete = await req.payload.findByID({
              collection: 'media',
              id: req.params.id,
            })

            // If the doc has a filename, delete from Blob
            if (docToDelete && docToDelete.filename) {
              await del(docToDelete.filename)
            }
          } catch (error) {
            console.error('Vercel Blob delete error:', error)
          }
        }
      },
    ],
  },
}

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
  plugins: [
    ...plugins,
    // Add our custom media storage plugin
    customMediaStoragePlugin,
  ],
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
