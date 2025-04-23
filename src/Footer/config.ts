import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateFooter } from './hooks/revalidateFooter'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
  },
  fields: [
    // Email Signup Section
    {
      name: 'emailSignupText',
      type: 'text',
      label: 'Email Signup Text',
      defaultValue: 'Get our latest insights'
    },
    
    // Acknowledgement of Country
    {
      name: 'acknowledgementText',
      type: 'textarea',
      label: 'Acknowledgement of Country',
      defaultValue: 'Three Tomorrows respectfully acknowledges the Traditional Owners of the land, the Wurundjeri Woi-wurrung and Bunurong / Boon Wurrung peoples of the Kulin and pays respect to their Elders past and present.'
    },
    
    // Site Pages Section
    {
      name: 'sitePages',
      type: 'array',
      label: 'Site Pages',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Footer/RowLabel#RowLabel',
        },
      },
    },
    
    // Social Links Section
    {
      name: 'socialLinks',
      type: 'array',
      label: 'Social Links',
      fields: [
        {
          name: 'platform',
          type: 'text',
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          required: true,
        },
        {
          name: 'openInNewTab',
          type: 'checkbox',
          label: 'Open in new tab',
          defaultValue: true,
        }
      ],
      maxRows: 5,
      admin: {
        initCollapsed: true,
      },
    },
    
    // Footer Logo
    {
      name: 'footerLogo',
      type: 'upload',
      relationTo: 'media',
      label: 'Footer Logo',
      required: false,
    },
    
    // Copyright Text
    {
      name: 'copyrightText',
      type: 'text',
      label: 'Copyright Text',
      defaultValue: 'All rights reserved.',
    },
    
    // Keeping your existing navItems for compatibility
    {
      name: 'navItems',
      type: 'array',
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Footer/RowLabel#RowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateFooter],
  },
}