import type { Block } from 'payload'

import {
  lexicalEditor,
  AlignFeature,
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
} from '@payloadcms/richtext-lexical'

export const FormBlock: Block = {
  slug: 'formBlock',
  interfaceName: 'FormBlock',
  fields: [
    {
      name: 'form',
      type: 'relationship',
      relationTo: 'forms',
      required: true,
    },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'standard',
      options: [
        {
          label: 'Standard (1-column)',
          value: 'standard',
        },
        {
          label: 'Two Column (Intro + Form)',
          value: 'twoColumn',
        },
      ],
      admin: {
        description:
          'Choose between a standard single column layout or a two column layout with intro content on the left and form on the right.',
      },
    },
    {
      name: 'backgroundType',
      type: 'select',
      defaultValue: 'none',
      options: [
        {
          label: 'None',
          value: 'none',
        },
        {
          label: 'Background Image',
          value: 'image',
        },
        {
          label: 'Background Color',
          value: 'color',
        },
      ],
      admin: {
        description: 'Choose the type of background for this form block.',
      },
    },
    {
      name: 'enableBackgroundImage',
      type: 'checkbox',
      label: 'Enable Background Image',
      defaultValue: false,
      admin: {
        condition: (_, { backgroundType }) => backgroundType === 'image',
        hidden: true,
      },
    },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Upload an image to use as the background for this form block.',
        condition: (_, { backgroundType }) => backgroundType === 'image',
      },
    },
    {
      name: 'backgroundColor',
      type: 'text',
      admin: {
        description: 'Enter a HEX color code (e.g., #FF5733) for the background color.',
        condition: (_, { backgroundType }) => backgroundType === 'color',
      },
      validate: (val) => {
        if (!val) return true // Allow empty values
        const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
        if (!hexColorRegex.test(val)) {
          return 'Please enter a valid HEX color code (e.g., #FF5733 or #F73)'
        }
        return true
      },
    },
    {
      name: 'backgroundOverlay',
      type: 'select',
      defaultValue: 'none',
      options: [
        {
          label: 'None',
          value: 'none',
        },
        {
          label: 'Light',
          value: 'light',
        },
        {
          label: 'Dark',
          value: 'dark',
        },
        {
          label: 'Gradient',
          value: 'gradient',
        },
      ],
      admin: {
        description: 'Add an overlay to the background to improve readability.',
        condition: (_, data) => data.backgroundType === 'image' || data.backgroundType === 'color',
      },
    },
    {
      name: 'enableIntro',
      type: 'checkbox',
      label: 'Enable Intro Content',
    },
    {
      name: 'introContent',
      type: 'richText',
      admin: {
        condition: (_, { enableIntro }) => Boolean(enableIntro),
      },
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }),
            AlignFeature({
              alignments: ['left', 'center', 'right', 'justify'],
            }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: 'Intro Content',
    },
  ],
  graphQL: {
    singularName: 'FormBlock',
  },
  labels: {
    plural: 'Form Blocks',
    singular: 'Form Block',
  },
}
