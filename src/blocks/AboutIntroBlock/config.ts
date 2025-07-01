import type { Block } from 'payload'

export const AboutIntroBlock: Block = {
  slug: 'aboutIntroBlock',
  interfaceName: 'AboutIntroBlock',
  labels: {
    singular: 'About Intro Block',
    plural: 'About Intro Blocks',
  },
  fields: [
    {
      name: 'heroContent',
      type: 'group',
      label: 'Hero Content',
      fields: [
        {
          name: 'eyebrow',
          type: 'text',
          label: 'Pre Title Text',
          required: false,
          defaultValue: 'About Us',
        },
        {
          name: 'title',
          type: 'text',
          label: 'Introduction Text',
          required: true,
          defaultValue: 'Placeholder text that can be edited in the CMS',
        },
      ],
    },
  ],
}
