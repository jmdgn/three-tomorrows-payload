import type { Block } from 'payload'

export const AccordionBlock: Block = {
  slug: 'accordionBlock',
  interfaceName: 'AccordionBlock',
  labels: {
    singular: 'Accordion Block',
    plural: 'Accordion Blocks',
  },
  fields: [
    {
      name: 'title',
      label: 'Block Title',
      type: 'text',
      required: false,
    },
    {
      name: 'accordionItems',
      type: 'array',
      label: 'Accordion Items',
      minRows: 1,
      maxRows: 10, // You can adjust this as needed
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Item Title',
          required: true,
        },
        {
          name: 'content',
          type: 'textarea',
          label: 'Item Content',
          required: true,
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Item Image (Optional)',
        },
      ],
      defaultValue: [
        {
          title: 'First Item',
          content: 'This is the content for the first accordion item.',
        },
      ],
    },
  ],
}
