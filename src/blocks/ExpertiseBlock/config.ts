import type { Block } from 'payload'

export const ExpertiseBlock: Block = {
  slug: 'expertiseBlock',
  interfaceName: 'ExpertiseBlock',
  labels: {
    singular: 'Expertise Block',
    plural: 'Expertise Blocks',
  },
  fields: [
    {
      name: 'backgroundImage',
      label: 'Background Image',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },
    {
      type: 'group',
      name: 'heroSection',
      label: 'Hero Section',
      fields: [
        {
          name: 'emergingFuturesTitle',
          type: 'text',
          label: 'Emerging Futures Title',
          defaultValue: 'Emerging Futures Technology',
          required: true,
        },
        {
          name: 'emergingFuturesSubtitle',
          type: 'textarea',
          label: 'Emerging Futures Subtitle',
          defaultValue:
            'Cutting through noise to identify the signals that matter most for your future. Helping you see beyond the horizon and prepare for multiple possible tomorrows.',
          required: true,
        },
        {
          name: 'sustainabilityTitle',
          type: 'text',
          label: 'Sustainability Title',
          defaultValue: 'Strategic Sustainability & Social Impact',
          required: true,
        },
        {
          name: 'sustainabilitySubtitle',
          type: 'textarea',
          label: 'Sustainability Subtitle',
          defaultValue:
            'Cutting through noise to identify the signals that matter most for your future. Helping you see beyond the horizon and prepare for multiple possible tomorrows.',
          required: true,
        },
      ],
    },
    {
      type: 'group',
      name: 'emergingFuturesData',
      label: 'Emerging Futures Technology Data',
      fields: [
        {
          name: 'panelTitle',
          label: 'Panel Title',
          type: 'text',
          defaultValue: 'Emerging Futures Technology',
          required: true,
        },
        {
          name: 'panelIcon',
          label: 'Panel Icon (80x80)',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'tabs',
          type: 'array',
          label: 'Information Tabs',
          minRows: 1,
          maxRows: 4,
          fields: [
            {
              name: 'title',
              type: 'text',
              label: 'Tab Title',
              required: true,
            },
            {
              name: 'content',
              type: 'textarea',
              label: 'Tab Content',
              required: true,
            },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              label: 'Tab Image (Optional)',
            },
          ],
          defaultValue: [
            {
              title: 'AI Integration',
              content:
                'Cutting through noise to identify the signals that matter most for your future. Helping you see beyond the horizon and prepare for multiple possible tomorrows.',
            },
          ],
        },
      ],
    },
    {
      type: 'group',
      name: 'sustainabilityData',
      label: 'Strategic Sustainability & Social Impact Data',
      fields: [
        {
          name: 'panelTitle',
          label: 'Panel Title',
          type: 'text',
          defaultValue: 'Strategic Sustainability & Social Impact',
          required: true,
        },
        {
          name: 'panelIcon',
          label: 'Panel Icon (80x80)',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'tabs',
          type: 'array',
          label: 'Information Tabs',
          minRows: 1,
          maxRows: 4,
          fields: [
            {
              name: 'title',
              type: 'text',
              label: 'Tab Title',
              required: true,
            },
            {
              name: 'content',
              type: 'textarea',
              label: 'Tab Content',
              required: true,
            },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              label: 'Tab Image (Optional)',
            },
          ],
          defaultValue: [
            {
              title: 'Shared Value Creation',
              content:
                'Cutting through noise to identify the signals that matter most for your future. Helping you see beyond the horizon and prepare for multiple possible tomorrows.',
            },
          ],
        },
      ],
    },
    {
      type: 'group',
      name: 'animations',
      label: 'Animation Settings',
      fields: [
        {
          name: 'enableParallax',
          type: 'checkbox',
          label: 'Enable Parallax Effects',
          defaultValue: true,
        },
        {
          name: 'scrollSpeed',
          type: 'number',
          label: 'Horizontal Scroll Speed',
          defaultValue: 1,
          min: 0.5,
          max: 2,
          admin: {
            step: 0.1,
            description: 'Adjust the speed of horizontal scrolling (1 is default)',
          },
        },
      ],
    },
  ],
}
