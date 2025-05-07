import { CollectionConfig } from 'payload/types'

export const Homepage: CollectionConfig = {
  slug: 'homepage',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'updatedAt'],
    label: 'Homepage',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      defaultValue: 'Homepage Content',
    },
    {
      name: 'heroSection',
      type: 'group',
      fields: [
        {
          name: 'heading',
          type: 'text',
          defaultValue: 'Disruption By Design',
        },
        {
          name: 'subheading',
          type: 'text',
          defaultValue: 'Strategy Consultancy',
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Mobile Description',
          defaultValue:
            "Disruption isn't just inevitable—it's necessary. Today's business models aren't future-fit in a world transformed by technology, values, and changing expectations.",
        },
        {
          name: 'desktopDescription',
          type: 'textarea',
          defaultValue:
            "Disruption isn't just inevitable—it's necessary. Today's business models aren't future-fit in a world transformed by technology, values, and changing expectations. The organisations that will thrive are those redesigning their relationship with people and planet—creating purposeful disruption rather than merely responding to it.",
        },
        {
          name: 'ctaText',
          type: 'text',
          defaultValue: 'Scroll to discover tomorrow',
        },
      ],
    },
    {
      name: 'introSection',
      type: 'group',
      fields: [
        {
          name: 'statement',
          type: 'textarea',
          defaultValue:
            "Our approach isn't about predicting tomorrow—it's about building your capability to shape it. We focus your attention on what truly matters, guiding teams to see possibility where others see only challenges.",
        },
      ],
    },
    {
      name: 'servicesSection',
      type: 'group',
      fields: [
        {
          name: 'heading',
          type: 'text',
          defaultValue: 'Our Services',
        },
        {
          name: 'subheading',
          type: 'text',
          defaultValue: 'Our services form a natural progression from understanding to action.',
        },
        {
          name: 'ctaText',
          type: 'text',
          defaultValue: 'How our services can help you',
        },
        {
          name: 'services',
          type: 'array',
          fields: [
            {
              name: 'number',
              type: 'text',
              defaultValue: '01',
            },
            {
              name: 'title',
              type: 'text',
              defaultValue: 'Intelligence',
            },
            {
              name: 'breakTitle',
              type: 'text',
              defaultValue: 'Trend',
              admin: {
                description: 'The part of the title that should be on a separate line',
              },
            },
            {
              name: 'description',
              type: 'textarea',
              defaultValue:
                'Cutting through noise to identify the signals that matter most for your future. Helping you see beyond the horizon and prepare for multiple possible tomorrows.',
            },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              filterOptions: {
                mimeType: { contains: 'image' },
              },
            },
          ],
          defaultValue: [
            {
              number: '01',
              title: 'Intelligence',
              breakTitle: 'Trend',
              description:
                'Cutting through noise to identify the signals that matter most for your future. Helping you see beyond the horizon and prepare for multiple possible tomorrows.',
            },
            {
              number: '02',
              title: 'Workshops',
              breakTitle: 'Foresight',
              description:
                "Collaborative sessions that build your team's capacity to think differently about change and identify strategic opportunities within emerging trends.",
            },
            {
              number: '03',
              title: 'Planning',
              breakTitle: 'Strategic',
              description:
                'Facilitation of strategy development processes that align teams, clarify purpose and create actionable roadmaps - independent of or informed by trend analysis.',
            },
            {
              number: '04',
              title: 'Support',
              breakTitle: 'Implementation',
              description:
                'Converting insights and strategy into clear action plans that leverage your organisational strengths while building internal capability.',
            },
          ],
        },
      ],
    },
    {
      name: 'factoidsSection',
      type: 'group',
      fields: [
        {
          name: 'heading',
          type: 'text',
          defaultValue: 'We are entering an unprecedented age of change',
        },
        {
          name: 'skipButtonText',
          type: 'text',
          defaultValue: 'Skip Industry Facts',
        },
        {
          name: 'factoids',
          type: 'array',
          fields: [
            {
              name: 'text',
              type: 'textarea',
            },
          ],
          defaultValue: [
            { text: '70% of small businesses will transition to new ownership in the next decade' },
            { text: 'AI set to automate 25-40% of work activities by 2030' },
            {
              text: 'Social media has evolved from marketing channel to critical business infrastructure',
            },
            { text: "Over 50% of the world's top 100 brands have experimented with Web3" },
            { text: 'AI could displace 83,000,000 jobs over the next 5 years' },
            { text: '10,000 baby boomers retire daily' },
          ],
        },
      ],
    },
    {
      name: 'expertiseSection',
      type: 'group',
      fields: [
        {
          name: 'heading',
          type: 'text',
          defaultValue: 'Specialised Expertise Areas',
        },
        {
          name: 'subheading',
          type: 'text',
          defaultValue:
            'Beyond our core strategic approach, we offer specialised expertise in two transformative domains:',
        },
        {
          name: 'techExpertise',
          type: 'group',
          fields: [
            {
              name: 'heading',
              type: 'text',
              defaultValue: 'Emerging Technology Futures',
            },
            {
              name: 'items',
              type: 'array',
              fields: [
                {
                  name: 'text',
                  type: 'text',
                },
                {
                  name: 'isImage',
                  type: 'checkbox',
                  defaultValue: false,
                },
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    condition: (data, siblingData) => siblingData.isImage,
                  },
                  filterOptions: {
                    mimeType: { contains: 'image' },
                  },
                },
              ],
              defaultValue: [
                { text: 'AI Integration', isImage: false },
                { text: 'Web3 & Blockchain', isImage: false },
                { isImage: true },
                { text: 'Digital Transformation', isImage: false },
                { text: 'Tech Evaluation', isImage: false },
                { isImage: true },
              ],
            },
          ],
        },
        {
          name: 'sustainabilityExpertise',
          type: 'group',
          fields: [
            {
              name: 'heading',
              type: 'text',
              defaultValue: 'Strategic Sustainability & Social Impact',
            },
            {
              name: 'items',
              type: 'array',
              fields: [
                {
                  name: 'text',
                  type: 'text',
                },
                {
                  name: 'isImage',
                  type: 'checkbox',
                  defaultValue: false,
                },
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    condition: (data, siblingData) => siblingData.isImage,
                  },
                  filterOptions: {
                    mimeType: { contains: 'image' },
                  },
                },
              ],
              defaultValue: [
                { text: 'Shared Value Creation', isImage: false },
                { text: 'Sustainability Integration', isImage: false },
                { isImage: true },
                { text: 'Social Impact', isImage: false },
                { text: 'ESG Strategy', isImage: false },
                { isImage: true },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'contactSection',
      type: 'group',
      fields: [
        {
          name: 'heading',
          type: 'text',
          defaultValue: 'Contact Us',
        },
        {
          name: 'description',
          type: 'textarea',
          defaultValue:
            "Let's talk about how we can implement strategy and transformation into your business so help you shape tomorrow.",
        },
        {
          name: 'ctaText',
          type: 'text',
          defaultValue: "Let's Talk",
        },
      ],
    },
  ],
}

export default Homepage
