import type { Block } from 'payload'

export const HeaderSection: Block = {
  slug: 'headerSection',
  interfaceName: 'HeaderSectionBlock',
  labels: {
    singular: 'Header Section',
    plural: 'Header Sections',
  },
  fields: [
    {
      name: 'headline',
      type: 'text',
      label: 'Headline',
      required: true,
      defaultValue: 'Work with us',
    },
    {
      name: 'subheadline',
      type: 'textarea',
      label: 'Subheadline',
      defaultValue:
        'Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo. Elit sunt amet fugiat veniam occaecat fugiat.',
    },
    {
      name: 'showBackgroundImage',
      label: 'Show Background Image',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'backgroundImage',
      label: 'Background Image',
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: {
        condition: (data) => data?.showBackgroundImage === true,
      },
    },
    {
      name: 'links',
      type: 'array',
      label: 'Links',
      minRows: 1,
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Link Name',
          required: true,
        },
        {
          name: 'href',
          type: 'text',
          label: 'Link URL',
          defaultValue: '#',
          required: true,
        },
      ],
    },
    {
      name: 'stats',
      type: 'array',
      label: 'Stats',
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Stat Name',
          required: true,
        },
        {
          name: 'value',
          type: 'text',
          label: 'Stat Value',
          required: true,
        },
      ],
    },
  ],
}
