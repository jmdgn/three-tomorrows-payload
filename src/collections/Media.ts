import type { CollectionConfig } from 'payload'
import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

const getS3Config = () => {
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

  console.log('Using local storage for media (development or missing S3 credentials)')
  return {
    disableLocalStorage: false,
    staticURL: '/media',
  }
}

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
        if (process.env.NODE_ENV === 'development') {
          console.log('MEDIA afterRead - Processing document:', doc ? doc.id : 'undefined')
        }

        if (doc) {
          if (doc.url && !doc.url.startsWith('http')) {
            const baseUrl =
              process.env.NEXT_PUBLIC_SERVER_URL ||
              'https://three-tomorrows-payload-production.up.railway.app'
            const sanitizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl

            const sanitizedFileUrl = doc.url.startsWith('/') ? doc.url : `/${doc.url}`

            const oldUrl = doc.url
            doc.url = `${sanitizedBaseUrl}${sanitizedFileUrl}`

            if (process.env.NODE_ENV === 'development') {
              console.log(`Fixed URL: ${oldUrl} → ${doc.url}`)
            }

            if (doc.sizes) {
              Object.keys(doc.sizes).forEach((size) => {
                if (
                  doc.sizes[size] &&
                  doc.sizes[size].url &&
                  !doc.sizes[size].url.startsWith('http')
                ) {
                  const sizeUrl = doc.sizes[size].url
                  const sanitizedSizeUrl = sizeUrl.startsWith('/') ? sizeUrl : `/${sizeUrl}`
                  const oldSizeUrl = doc.sizes[size].url
                  doc.sizes[size].url = `${sanitizedBaseUrl}${sanitizedSizeUrl}`

                  if (process.env.NODE_ENV === 'development') {
                    console.log(`Fixed ${size} URL: ${oldSizeUrl} → ${doc.sizes[size].url}`)
                  }
                }
              })
            }
          } else if (doc.url && process.env.NODE_ENV === 'development') {
            console.log('URL already has protocol, keeping as is:', doc.url)
          }

          if (doc.url && doc.url.includes('s3.amazonaws.com')) {
            if (process.env.NODE_ENV === 'development') {
              console.log('Detected S3 URL:', doc.url)
            }

            if (doc.sizes) {
              Object.keys(doc.sizes).forEach((size) => {
                if (
                  doc.sizes[size] &&
                  doc.sizes[size].url &&
                  !doc.sizes[size].url.includes('s3.amazonaws.com')
                ) {
                  if (process.env.NODE_ENV === 'development') {
                    console.log(`Size ${size} URL might need S3 prefix:`, doc.sizes[size].url)
                  }
                }
              })
            }
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
