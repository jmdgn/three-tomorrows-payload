import type { Block } from 'payload'

export const ExpertiseGrid: Block = {
  slug: 'expertiseGrid',
  interfaceName: 'ExpertiseGridBlock',
  labels: {
    singular: 'Expertise Grid',
    plural: 'Expertise Grids',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Section Title',
      admin: {
        description: 'Main title for the expertise section (optional)',
      },
    },
    {
      name: 'subtitle',
      type: 'textarea',
      label: 'Section Subtitle',
      admin: {
        description: 'Subtitle or description for the expertise section (optional)',
      },
    },
    {
      name: 'leftColumn',
      type: 'group',
      label: 'Left Column',
      fields: [
        {
          name: 'heading',
          type: 'text',
          label: 'Column Heading',
          required: true,
          defaultValue: 'Emerging Technology Futures',
        },
        {
          name: 'headingColor',
          type: 'select',
          label: 'Heading Color',
          defaultValue: '#171744',
          options: [
            {
              label: 'Navy Blue',
              value: '#171744',
            },
            {
              label: '3T Green',
              value: '#3BE494',
            },
            {
              label: 'White',
              value: '#FFFFFF',
            },
          ],
          admin: {
            description: 'Choose the color for the heading text',
          },
        },
        {
          name: 'items',
          type: 'array',
          label: 'Expertise Items',
          minRows: 1,
          maxRows: 6,
          required: true,
          fields: [
            {
              name: 'text',
              type: 'text',
              label: 'Item Title',
              required: true,
            },
            {
              name: 'hoverText',
              type: 'textarea',
              label: 'Description Text',
              required: true,
              admin: {
                description: 'Text that appears below the title',
              },
            },
            {
              name: 'link',
              type: 'text',
              label: 'Link URL',
              admin: {
                description: 'Optional link URL (leave empty to disable link)',
              },
            },
          ],
          defaultValue: [
            {
              text: 'AI Integration',
              hoverText:
                'Seamlessly integrate artificial intelligence into your business operations.',
            },
            {
              text: 'Web3 & Blockchain',
              hoverText: 'Navigate the decentralized future with confidence and clarity.',
            },
            {
              text: 'Digital Transformation',
              hoverText: 'Transform your business for the digital age with proven strategies.',
            },
          ],
        },
      ],
    },
    {
      name: 'rightColumn',
      type: 'group',
      label: 'Right Column',
      fields: [
        {
          name: 'heading',
          type: 'text',
          label: 'Column Heading',
          required: true,
          defaultValue: 'Strategic Sustainability & Social Impact',
        },
        {
          name: 'headingColor',
          type: 'select',
          label: 'Heading Color',
          defaultValue: '#171744',
          options: [
            {
              label: 'Navy Blue',
              value: '#171744',
            },
            {
              label: '3T Green',
              value: '#3BE494',
            },
            {
              label: 'White',
              value: '#FFFFFF',
            },
          ],
          admin: {
            description: 'Choose the color for the heading text',
          },
        },
        {
          name: 'items',
          type: 'array',
          label: 'Expertise Items',
          minRows: 1,
          maxRows: 6,
          required: true,
          fields: [
            {
              name: 'text',
              type: 'text',
              label: 'Item Title',
              required: true,
            },
            {
              name: 'hoverText',
              type: 'textarea',
              label: 'Description Text',
              required: true,
              admin: {
                description: 'Text that appears below the title',
              },
            },
            {
              name: 'link',
              type: 'text',
              label: 'Link URL',
              admin: {
                description: 'Optional link URL (leave empty to disable link)',
              },
            },
          ],
          defaultValue: [
            {
              text: 'Shared Value Creation',
              hoverText:
                'Create business value while addressing social and environmental challenges.',
            },
            {
              text: 'Sustainability Integration',
              hoverText: 'Embed sustainability into your core business strategy.',
            },
            {
              text: 'ESG Strategy',
              hoverText: 'Develop comprehensive environmental, social, and governance strategies.',
            },
          ],
        },
      ],
    },
  ],
}
