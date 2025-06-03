import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import { Plugin } from 'payload'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { searchFields } from '@/search/fieldOverrides'
import { beforeSyncWithSearch } from '@/search/beforeSync'

import { Page, Post } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'

const generateTitle: GenerateTitle<Post | Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} | Payload Website Template` : 'Payload Website Template'
}

const generateURL: GenerateURL<Post | Page> = ({ doc }) => {
  const url = getServerSideURL()

  return doc?.slug ? `${url}/${doc.slug}` : url
}

// Custom form fields with placeholder
const customFormFields = {
  text: {
    label: 'Text',
    fields: [
      {
        name: 'name',
        type: 'text',
        label: 'Field Name',
        required: true,
      },
      {
        name: 'label',
        type: 'text',
        label: 'Field Label',
      },
      {
        name: 'placeholder',
        type: 'text',
        label: 'Placeholder Text',
        admin: {
          description: 'Optional placeholder text that appears in the empty field',
        },
      },
      {
        name: 'defaultValue',
        type: 'text',
        label: 'Default Value',
      },
      {
        name: 'required',
        type: 'checkbox',
        label: 'Required',
      },
      {
        name: 'width',
        type: 'number',
        label: 'Field Width (%)',
        min: 0,
        max: 100,
      },
    ],
  },
  email: {
    label: 'Email',
    fields: [
      {
        name: 'name',
        type: 'text',
        label: 'Field Name',
        required: true,
      },
      {
        name: 'label',
        type: 'text',
        label: 'Field Label',
      },
      {
        name: 'placeholder',
        type: 'text',
        label: 'Placeholder Text',
        admin: {
          description: 'Optional placeholder text that appears in the empty field',
        },
      },
      {
        name: 'defaultValue',
        type: 'text',
        label: 'Default Value',
      },
      {
        name: 'required',
        type: 'checkbox',
        label: 'Required',
      },
      {
        name: 'width',
        type: 'number',
        label: 'Field Width (%)',
        min: 0,
        max: 100,
      },
    ],
  },
  textarea: {
    label: 'Textarea',
    fields: [
      {
        name: 'name',
        type: 'text',
        label: 'Field Name',
        required: true,
      },
      {
        name: 'label',
        type: 'text',
        label: 'Field Label',
      },
      {
        name: 'placeholder',
        type: 'text',
        label: 'Placeholder Text',
        admin: {
          description: 'Optional placeholder text that appears in the empty field',
        },
      },
      {
        name: 'defaultValue',
        type: 'textarea',
        label: 'Default Value',
      },
      {
        name: 'required',
        type: 'checkbox',
        label: 'Required',
      },
      {
        name: 'rows',
        type: 'number',
        label: 'Rows',
        defaultValue: 3,
        min: 1,
      },
      {
        name: 'width',
        type: 'number',
        label: 'Field Width (%)',
        min: 0,
        max: 100,
      },
    ],
  },
  number: {
    label: 'Number',
    fields: [
      {
        name: 'name',
        type: 'text',
        label: 'Field Name',
        required: true,
      },
      {
        name: 'label',
        type: 'text',
        label: 'Field Label',
      },
      {
        name: 'placeholder',
        type: 'text',
        label: 'Placeholder Text',
        admin: {
          description: 'Optional placeholder text that appears in the empty field',
        },
      },
      {
        name: 'defaultValue',
        type: 'number',
        label: 'Default Value',
      },
      {
        name: 'required',
        type: 'checkbox',
        label: 'Required',
      },
      {
        name: 'width',
        type: 'number',
        label: 'Field Width (%)',
        min: 0,
        max: 100,
      },
    ],
  },
}

export const plugins: Plugin[] = [
  redirectsPlugin({
    collections: ['pages', 'posts'],
    overrides: {
      // @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              admin: {
                description: 'You will need to rebuild the website when changing this field.',
              },
            }
          }
          return field
        })
      },
      hooks: {
        afterChange: [revalidateRedirects],
      },
    },
  }),
  nestedDocsPlugin({
    collections: ['categories'],
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      ...customFormFields,
      payment: false,
    },
    formOverrides: {
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
    },
  }),
  searchPlugin({
    collections: ['posts'],
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
      fields: ({ defaultFields }) => {
        return [...defaultFields, ...searchFields]
      },
    },
  }),
  payloadCloudPlugin(),
]
