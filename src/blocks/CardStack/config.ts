import type { Block } from 'payload'

export const CardStack: Block = {
  slug: 'cardStack',
  interfaceName: 'CardStackBlock',
  labels: {
    singular: 'Card Stack',
    plural: 'Card Stacks',
  },
  fields: [
    {
      name: 'cards',
      type: 'array',
      label: 'Cards',
      minRows: 1,
      required: true,
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Card Title',
          required: true,
        },
        {
          name: 'content',
          type: 'textarea',
          label: 'Card Content',
        },
        {
          name: 'backgroundColor',
          type: 'text',
          label: 'Background Color',
          defaultValue: '',
          admin: {
            description:
              'Enter a hex color code (e.g., #8314F9). Leave empty for transparent background.',
          },
        },
        {
          name: 'textColor',
          type: 'text',
          label: 'Text Color',
          defaultValue: '#191C1C',
          admin: {
            description: 'Enter a hex color code (e.g., #191C1C)',
          },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Card Image (Optional)',
        },
      ],
    },
    {
      name: 'containerWidth',
      type: 'select',
      label: 'Container Width',
      defaultValue: 'default',
      options: [
        {
          label: 'Default',
          value: 'default',
        },
        {
          label: 'Full Width',
          value: 'full',
        },
        {
          label: 'Wide',
          value: 'wide',
        },
      ],
    },
  ],
}
