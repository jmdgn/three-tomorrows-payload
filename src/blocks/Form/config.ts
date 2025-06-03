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
      name: 'leftContentType',
      type: 'select',
      defaultValue: 'intro',
      options: [
        {
          label: 'Intro Content',
          value: 'intro',
        },
        {
          label: 'Contact Information',
          value: 'contact',
        },
      ],
      admin: {
        condition: (_, { layout }) => layout === 'twoColumn',
        description: 'Choose what to display on the left side of the form',
      },
    },
    {
      name: 'enableIntro',
      type: 'checkbox',
      label: 'Enable Intro Content',
      admin: {
        condition: (_, { leftContentType, layout }) =>
          layout === 'standard' || (layout === 'twoColumn' && leftContentType === 'intro'),
      },
    },
    {
      name: 'introContent',
      type: 'richText',
      admin: {
        condition: (_, { enableIntro, leftContentType, layout }) =>
          Boolean(enableIntro) && (layout === 'standard' || leftContentType === 'intro'),
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
    {
      name: 'contactInfo',
      type: 'group',
      label: 'Contact Information',
      admin: {
        condition: (_, { leftContentType, layout }) =>
          layout === 'twoColumn' && leftContentType === 'contact',
      },
      fields: [
        {
          name: 'heading',
          type: 'text',
          label: 'Heading',
          defaultValue: 'Want to contact us directly?',
          required: true,
        },
        {
          name: 'contacts',
          type: 'array',
          label: 'Contact Persons',
          minRows: 1,
          maxRows: 2,
          fields: [
            {
              name: 'person',
              type: 'relationship',
              relationTo: 'users',
              label: 'Person',
              required: true,
              admin: {
                description: 'Select a user to display their profile information',
              },
            },
            {
              name: 'email',
              type: 'email',
              label: 'Email Override',
              admin: {
                description: 'Override the email from the user profile (optional)',
              },
            },
            {
              name: 'phone',
              type: 'text',
              label: 'Phone Number',
              admin: {
                description: 'Phone number for this contact',
              },
            },
          ],
        },
      ],
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
  ],
  graphQL: {
    singularName: 'FormBlock',
  },
  labels: {
    plural: 'Form Blocks',
    singular: 'Form Block',
  },
}
