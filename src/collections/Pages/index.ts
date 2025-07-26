import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { extendWithTextAlign } from '@/fields/extendWithTextAlign'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { Archive } from '../../blocks/ArchiveBlock/config'
import { CallToAction } from '../../blocks/CallToAction/config'
import { Content } from '../../blocks/Content/config'
import { FormBlock } from '../../blocks/Form/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { hero } from '@/heros/config'
import { slugField } from '@/fields/slug'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { revalidateDelete, revalidatePage } from './hooks/revalidatePage'
import { TitleIntroductionBlock } from '../../blocks/Titles/config'
import { CardStack } from '../../blocks/CardStack/config'
import { ContactCTA } from '../../blocks/ContactCTA/config'
import { TabbedPanel } from '../../blocks/TabbedPanel/config'
import { ExpertiseBlock } from '../../blocks/ExpertiseBlock/config'
import { AboutIntroBlock } from '../../blocks/AboutIntroBlock/config'
import { HeaderSectionConfig } from '../../blocks/HeaderSection'
import { ExpertiseGridConfig } from '../../blocks/ExpertiseGrid'
import { OurServicesIntroConfig } from '../../blocks/OurServicesIntro'
import { AuroraFeatureConfig } from '../../blocks/AuroraFeature'
import { AccordionBlockConfig } from '../../blocks/AccordionBlock'
import { ServiceLinkPanelsBlockConfig } from '../../blocks/ServiceLinkPanelsBlock'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

export const Pages: CollectionConfig<'pages'> = {
  slug: 'pages',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  defaultPopulate: {
    title: true,
    slug: true,
    parent: true,
    fullPath: true,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'parent', 'fullPath', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) => {
        const path = generatePreviewPath({
          slug: typeof data?.slug === 'string' ? data.slug : '',
          collection: 'pages',
          req,
        })

        return path
      },
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: typeof data?.slug === 'string' ? data.slug : '',
        collection: 'pages',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'pages',
      admin: {
        description: 'Select a parent page to create a hierarchy',
        position: 'sidebar',
      },
      validate: (val, { data, operation }) => {
        if (operation === 'update' && val === data.id) {
          return 'A page cannot be its own parent'
        }
        return true
      },
    },
    {
      name: 'backgroundColor',
      type: 'select',
      label: 'Page Background Color',
      defaultValue: '#FBFCFD',
      options: [
        {
          label: 'Light Grey',
          value: '#FBFCFD',
        },
        {
          label: 'Green',
          value: '#3BE494',
        },
        {
          label: 'Navy',
          value: '#171744',
        },
      ],
      admin: {
        description: 'Choose the background color for this page',
        position: 'sidebar',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [hero],
          label: 'Hero',
        },
        {
          fields: [
            {
              name: 'introduction',
              type: 'richText',
              editor: lexicalEditor(extendWithTextAlign()),
              admin: {
                description: 'Introduction text with alignment options',
              },
            },
            {
              name: 'layout',
              type: 'blocks',
              blocks: [
                AccordionBlockConfig,
                AboutIntroBlock,
                Archive,
                AuroraFeatureConfig,
                CallToAction,
                CardStack,
                ContactCTA,
                Content,
                ExpertiseBlock,
                ExpertiseGridConfig,
                FormBlock,
                HeaderSectionConfig,
                MediaBlock,
                OurServicesIntroConfig,
                ServiceLinkPanelsBlockConfig, // 2. Add the new block to the list
                TabbedPanel,
                TitleIntroductionBlock,
              ],
              required: true,
              admin: {
                initCollapsed: true,
              },
            },
          ],
          label: 'Content',
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              hasGenerateFn: true,

              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'fullPath',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Auto-generated full URL path',
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          async ({ data, req: { payload } }) => {
            let path = data.slug || ''
            let currentParent = data.parent

            while (currentParent) {
              try {
                const parent = await payload.findByID({
                  collection: 'pages',
                  id: currentParent,
                })
                if (parent && parent.slug) {
                  path = `${parent.slug}/${path}`
                  currentParent = parent.parent
                } else {
                  break
                }
              } catch (error) {
                break
              }
            }

            return path
          },
        ],
      },
    },
    ...slugField(),
  ],
  hooks: {
    afterChange: [revalidatePage],
    beforeChange: [populatePublishedAt],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100,
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
