import type { Block } from 'payload'

export const AuroraFeature: Block = {
  slug: 'auroraFeature',
  interfaceName: 'AuroraFeatureBlock',
  labels: {
    singular: 'Aurora Feature',
    plural: 'Aurora Features',
  },
  fields: [
    {
      name: 'heading',
      type: 'textarea',
      label: 'Heading Text',
      required: true,
      admin: {
        description: 'The large text that will be centered over the video background.',
      },
    },
    {
      name: 'textColor',
      type: 'select',
      label: 'Text Color',
      defaultValue: '#FFFFFF',
      options: [
        {
          label: 'White',
          value: '#FFFFFF',
        },
        {
          label: '3T Green',
          value: '#3BE494',
        },
        {
          label: 'Dark Navy',
          value: '#171744',
        },
      ],
      admin: {
        description: 'Choose the color for the heading text.',
      },
    },
    {
      name: 'parallaxStrength',
      type: 'number',
      label: 'Parallax Strength',
      defaultValue: 40,
      admin: {
        description:
          'Controls how much the background video moves on scroll. Use negative values to reverse the direction. 0 disables the effect.',
        step: 5,
      },
    },
  ],
}
