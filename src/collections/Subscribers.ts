import { CollectionConfig } from 'payload/types';

export const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'subscriptionDate', 'status'],
    description: 'Email newsletter subscribers',
    components: {
      AfterList: 'src/components/Subscribers/SubscribersAfterList',
    },
  },
  access: {
    read: ({ req }) => {
      return Boolean(req.user);
    },
    create: () => true,
    update: ({ req }) => {
      return Boolean(req.user);
    },
    delete: ({ req }) => {
      return Boolean(req.user);
    },
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (!data.subscriptionDate) {
          data.subscriptionDate = new Date();
        }
        return data;
      },
    ],
    afterChange: [
      ({ doc }) => {
        console.log(`Subscriber ${doc.email} status: ${doc.status}`);
        return doc;
      },
    ],
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      admin: {
        description: 'Email address of the subscriber',
      },
    },
    {
      name: 'subscriptionDate',
      type: 'date',
      admin: {
        description: 'Date when the subscription was created',
        readOnly: true,
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        {
          label: 'Active',
          value: 'active',
        },
        {
          label: 'Unsubscribed',
          value: 'unsubscribed',
        },
      ],
      defaultValue: 'active',
      required: true,
      admin: {
        description: 'Subscription status',
      },
    },
    {
      name: 'source',
      type: 'text',
      admin: {
        description: 'Where this subscriber signed up from',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Admin notes about this subscriber',
      },
    },
  ],
};