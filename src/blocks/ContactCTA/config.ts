import type { Block } from 'payload'

export const ContactCTA: Block = {
  slug: 'contactCTA',
  interfaceName: 'ContactCTABlock',
  labels: {
    singular: 'Contact CTA',
    plural: 'Contact CTAs',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Heading',
      defaultValue: 'Contact Us',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      defaultValue:
        "Let's talk about how we can implement strategy and transformation into your business to help you shape tomorrow.",
      required: true,
    },
    {
      name: 'ctaText',
      type: 'text',
      label: 'Button Text',
      defaultValue: 'Talk To Us',
      required: true,
    },
    {
      name: 'ctaLink',
      type: 'text',
      label: 'Button Link',
      defaultValue: '/contact',
      required: true,
      admin: {
        description: 'Enter the URL where the button should link to (e.g., /contact)',
      },
    },
    {
      name: 'animationSettings',
      type: 'group',
      label: 'Animation Settings',
      fields: [
        {
          name: 'staggerDelay',
          type: 'number',
          label: 'Stagger Delay',
          defaultValue: 0.02,
          admin: {
            description: 'Delay between each word animation (in seconds)',
            step: 0.01,
          },
        },
        {
          name: 'duration',
          type: 'number',
          label: 'Animation Duration',
          defaultValue: 0.6,
          admin: {
            description: 'Duration of each word animation (in seconds)',
            step: 0.1,
          },
        },
      ],
    },
  ],
}
