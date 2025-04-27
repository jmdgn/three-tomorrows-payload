import type { CollectionConfig } from 'payload'
import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

// Function to get the appropriate S3 configuration
const getS3Config = () => {
  // Log to help with debugging
  console.log('Configuring Media collection with S3 settings:')
  console.log('- AWS_BUCKET_NAME:', process.env.AWS_BUCKET_NAME)
  console.log('- AWS_REGION:', process.env.AWS_REGION)
  console.log(
    '- AWS_ACCESS_KEY_ID:',
    process.env.AWS_ACCESS_KEY_ID ? 'Set (value hidden)' : 'Not set',
  )
  console.log(
    '- AWS_SECRET_ACCESS_KEY:',
    process.env.AWS_SECRET_ACCESS_KEY ? 'Set (value hidden)' : 'Not set',
  )

  // Check if running in production with S3 configured
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.AWS_BUCKET_NAME &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY
  ) {
    return {
      disableLocalStorage: true,
      staticURL: '/media',
    }
  }

  // Fallback to local storage for development
  console.log('Using local storage for media (development or missing S3 credentials)')
  return {
    disableLocalStorage: false,
    staticURL: '/media',
  }
}

// Get appropriate storage config
const storageConfig = getS3Config()

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  upload: {
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
    imageSizes: [
      { name: 'thumbnail', width: 300 },
      { name: 'square', width: 500, height: 500 },
      { name: 'small', width: 600 },
      { name: 'medium', width: 900 },
      { name: 'large', width: 1400 },
      { name: 'xlarge', width: 1920 },
      { name: 'og', width: 1200, height: 630, crop: 'center' },
    ],
    focalPoint: true,
    ...storageConfig,
  },
  hooks: {
    afterRead: [
      ({ doc }) => {
        // Make sure URLs are properly formatted
        if (doc && doc.url && !doc.url.startsWith('http')) {
          // Parse URL structure
          const baseUrl =
            process.env.NEXT_PUBLIC_SERVER_URL ||
            'https://three-tomorrows-payload-production.up.railway.app'
          const sanitizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl

          // Ensure URL starts with a slash
          const sanitizedFileUrl = doc.url.startsWith('/') ? doc.url : `/${doc.url}`

          // Construct full URL
          doc.url = `${sanitizedBaseUrl}${sanitizedFileUrl}`

          // Also fix sizes URLs if they exist
          if (doc.sizes) {
            Object.keys(doc.sizes).forEach((size) => {
              if (
                doc.sizes[size] &&
                doc.sizes[size].url &&
                !doc.sizes[size].url.startsWith('http')
              ) {
                const sizeUrl = doc.sizes[size].url
                const sanitizedSizeUrl = sizeUrl.startsWith('/') ? sizeUrl : `/${sizeUrl}`
                doc.sizes[size].url = `${sanitizedBaseUrl}${sanitizedSizeUrl}`
              }
            })
          }
        }

        return doc
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ],
      }),
    },
  ],
}
