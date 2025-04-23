import { CollectionConfig } from 'payload/types'

const HeroConfig: CollectionConfig = {
  slug: 'hero',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'backgroundScene',
      type: 'select',
      options: [
        { label: 'Ocean', value: 'ocean' },
        { label: 'Sphere', value: 'sphere' },
        { label: 'Bubbles', value: 'bubbles' },
        { label: 'Clouds', value: 'clouds' },
      ],
      defaultValue: 'ocean',
      required: true,
    },
  ],
}

export default HeroConfig
