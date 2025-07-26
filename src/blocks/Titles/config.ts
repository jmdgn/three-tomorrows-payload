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
      type: 'text',
      required: true,
      defaultValue: 'Description Subhead',
    },
    {
      name: 'centerAlignment',
      type: 'checkbox',
      label: 'Center Align',
      defaultValue: true,
    },
    {
      name: 'enableTextIndent',
      type: 'checkbox',
      label: 'Enable Text Indent',
      defaultValue: true,
      admin: {
        description: 'Add tab spacing to the first line of the subheading text',
      },
    },
  ],
}
