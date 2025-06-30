import type { Block } from 'payload'

export const TabbedPanel: Block = {
  slug: 'tabbedPanel',
  interfaceName: 'TabbedPanelBlock',
  labels: {
    singular: 'Tabbed Panel',
    plural: 'Tabbed Panels',
  },
  fields: [
    {
      name: 'fullWidth',
      type: 'checkbox',
      label: 'Full Width (Remove Padding)',
      defaultValue: false,
      admin: {
        description: 'Enable this to remove the default padding and make the block full width',
      },
    },
    {
      name: 'panel1',
      type: 'group',
      label: 'First Panel (Dark Background)',
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Panel Title',
          admin: {
            description: 'Main title for the first panel section',
          },
        },
        {
          name: 'tabs',
          type: 'array',
          label: 'Tabs',
          minRows: 1,
          maxRows: 4,
          required: true,
          fields: [
            {
              name: 'tabLabel',
              type: 'text',
              label: 'Tab Label',
              required: true,
              admin: {
                description: 'Label shown on the tab button',
              },
            },
            {
              name: 'contentTitle',
              type: 'text',
              label: 'Content Title',
              required: true,
              admin: {
                description: 'Title shown when this tab is active',
              },
            },
            {
              name: 'contentBody',
              type: 'textarea',
              label: 'Content Body',
              required: true,
              admin: {
                description: 'Body text shown when this tab is active',
              },
            },
            {
              name: 'contentImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Content Image',
              admin: {
                description: 'Image shown alongside the content',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'panel2',
      type: 'group',
      label: 'Second Panel (Light Background)',
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Panel Title',
          admin: {
            description: 'Main title for the second panel section',
          },
        },
        {
          name: 'tabs',
          type: 'array',
          label: 'Tabs',
          minRows: 1,
          maxRows: 4,
          required: true,
          fields: [
            {
              name: 'tabLabel',
              type: 'text',
              label: 'Tab Label',
              required: true,
              admin: {
                description: 'Label shown on the tab button',
              },
            },
            {
              name: 'contentTitle',
              type: 'text',
              label: 'Content Title',
              required: true,
              admin: {
                description: 'Title shown when this tab is active',
              },
            },
            {
              name: 'contentBody',
              type: 'textarea',
              label: 'Content Body',
              required: true,
              admin: {
                description: 'Body text shown when this tab is active',
              },
            },
            {
              name: 'contentImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Content Image',
              admin: {
                description: 'Image shown alongside the content',
              },
            },
          ],
        },
      ],
    },
  ],
}
