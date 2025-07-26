import type { Block } from 'payload'

export const OurServicesIntro: Block = {
  slug: 'ourServicesIntro',
  interfaceName: 'OurServicesIntroBlock',
  labels: {
    singular: 'Our Services Intro',
    plural: 'Our Services Intros',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Main Heading',
      required: true,
      defaultValue:
        'Beyond our core strategic approach, we offer specialised expertise in multiple transformative domains:',
      admin: {
        description: 'Main title for the services introduction section',
      },
    },
    {
      name: 'headingColor',
      type: 'select',
      label: 'Heading Color',
      defaultValue: '#171744',
      options: [
        {
          label: 'Dark Navy',
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
      name: 'subheading',
      type: 'textarea',
      label: 'Subheading',
      required: true,
      defaultValue: 'Our Services',
      admin: {
        description: 'Subtitle or section label',
      },
    },
    {
      name: 'serviceItems',
      type: 'array',
      label: 'Featured Services',
      minRows: 1,
      maxRows: 4,
      required: true,
      admin: {
        description: 'Service items to highlight',
      },
      fields: [
        {
          name: 'text',
          type: 'text',
          label: 'Service Title',
          required: true,
        },
        {
          name: 'hoverText',
          type: 'textarea',
          label: 'Service Description',
          required: true,
          admin: {
            description: 'Description text that appears below the title',
          },
        },
        {
          name: 'link',
          type: 'group',
          label: 'Link',
          admin: {
            description: 'Configure the link for this service item',
          },
          fields: [
            {
              name: 'type',
              type: 'radio',
              label: 'Link Type',
              options: [
                {
                  label: 'Internal Link',
                  value: 'reference',
                },
                {
                  label: 'Custom URL',
                  value: 'custom',
                },
                {
                  label: 'No Link',
                  value: 'none',
                },
              ],
              defaultValue: 'none',
              admin: {
                layout: 'horizontal',
              },
            },
            {
              name: 'newTab',
              type: 'checkbox',
              label: 'Open in new tab',
              admin: {
                style: {
                  alignSelf: 'flex-end',
                },
                condition: (_, siblingData) => siblingData?.type !== 'none',
              },
            },
            {
              name: 'reference',
              type: 'relationship',
              label: 'Document to link to',
              relationTo: ['pages'], // Adjust this to match your collection slugs
              required: true,
              maxDepth: 2,
              admin: {
                condition: (_, siblingData) => siblingData?.type === 'reference',
              },
            },
            {
              name: 'url',
              type: 'text',
              label: 'Custom URL',
              required: true,
              admin: {
                condition: (_, siblingData) => siblingData?.type === 'custom',
              },
            },
          ],
        },
      ],
      defaultValue: [
        {
          text: 'Trend Intelligence',
          hoverText: 'Strategic AI integration that transforms operations and accelerates growth.',
          link: {
            type: 'none',
          },
        },
        {
          text: 'Strategic Planning',
          hoverText:
            'We help businesses navigate Web3 with clarity, purpose, and technical precision.',
          link: {
            type: 'none',
          },
        },
        {
          text: 'Shared Value Consulting',
          hoverText:
            'We drive digital transformation that aligns technology with business ambition.',
          link: {
            type: 'none',
          },
        },
        {
          text: 'Digital Consulting',
          hoverText: 'Independent, insight-led tech assessments to guide smarter decisions.',
          link: {
            type: 'none',
          },
        },
      ],
    },
  ],
}
