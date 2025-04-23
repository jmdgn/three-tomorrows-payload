import type { CollectionConfig } from 'payload'
import { authenticated } from '../../access/authenticated'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: authenticated,
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['name', 'email'],
    useAsTitle: 'name',
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'email', 
      type: 'email',
      required: true,
      unique: true,
    },
    // Author profile fields
    {
      name: 'authorProfile',
      type: 'group',
      admin: {
        description: 'If this user is an author, fill out these fields to display their information publicly',
      },
      fields: [
        {
          name: 'isAuthor',
          type: 'checkbox',
          label: 'Is an Author',
          defaultValue: false,
        },
        {
          name: 'biography',
          type: 'textarea',
          admin: {
            condition: (data) => data?.authorProfile?.isAuthor,
            description: 'Short bio that appears with author name',
          },
        },
        {
          name: 'photo',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Square image recommended (min 300px x 300px)',
            condition: (data) => data?.authorProfile?.isAuthor,
          },
        },
        {
          name: 'socialMedia',
          type: 'group',
          admin: {
            condition: (data) => data?.authorProfile?.isAuthor,
          },
          fields: [
            {
              name: 'twitter',
              type: 'text',
              admin: {
                description: 'Twitter/X handle (without the @)',
              },
            },
            {
              name: 'linkedin',
              type: 'text',
              admin: {
                description: 'LinkedIn profile URL',
              },
            },
            {
              name: 'bluesky',
              type: 'text',
              admin: {
                description: 'Bluesky handle',
              },
            },
            {
              name: 'website',
              type: 'text',
              admin: {
                description: 'Personal website URL',
              },
            },
          ],
        },
      ],
    },
  ],
  timestamps: true,
}