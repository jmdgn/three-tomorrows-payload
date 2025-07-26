import type { Block } from 'payload'

export const ServiceLinkPanelsBlock: Block = {
  slug: 'serviceLinkPanels',
  interfaceName: 'ServiceLinkPanelsBlock',
  imageURL: 'https://placehold.co/600x400/333/FFF?text=Link+Panels',
  imageAltText: 'A preview of the two-column service link panels.',
  labels: {
    singular: 'Service Link Panel',
    plural: 'Service Link Panels',
  },
  fields: [
    {
      name: 'panels',
      label: 'Link Panels',
      type: 'array',
      minRows: 1,
      maxRows: 2,
      required: true,
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Title',
          required: true,
        },
        {
          name: 'subtext',
          type: 'textarea',
          label: 'Subtext',
          required: true,
        },
        {
          name: 'link',
          type: 'group',
          label: 'Link',
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
              ],
              defaultValue: 'reference',
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
              },
            },
            {
              name: 'reference',
              type: 'relationship',
              label: 'Document to link to',
              relationTo: ['pages'],
              required: true,
              maxDepth: 1,
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
    },
  ],
}
