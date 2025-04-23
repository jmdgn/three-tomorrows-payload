import { Block } from 'payload/types'

export const TitleIntroductionBlock: Block = {
  slug: 'titleIntroduction',
  labels: {
    singular: 'Title Introduction',
    plural: 'Title Introductions',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
      defaultValue: 'Heading',
    },
    {
      name: 'subheading',
      type: 'text',
      required: true,
      defaultValue: 'Description Subhead',
    },
    {
      name: 'centerAlignment',
      type: 'checkbox',
      label: 'Center Align',
      defaultValue: true,
    }
  ],
}