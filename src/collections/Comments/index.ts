import { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'

export const Comments: CollectionConfig = {
  slug: 'comments',
  admin: {
    useAsTitle: 'comment',
    defaultColumns: ['comment', 'post', 'name', 'rating', 'status', 'createdAt'],
    group: 'Shared Content',
  },
  access: {
    create: () => true, // Anyone can create a comment
    read: () => true, // Anyone can read comments
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'comment',
      type: 'textarea',
      required: false,
    },
    {
      name: 'rating',
      type: 'number',
      min: 1,
      max: 5,
      required: false,
    },
    {
      name: 'firebaseUID',
      type: 'text',
      required: true,
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'adminReply',
      type: 'textarea',
      access: {
        read: () => true,
        update: ({ data }) => !data?.parentId,
      },
    },

    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
      ],
      access: {
        update: authenticated, // Only admins can change status
      },
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'parentId',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'post',

      type: 'relationship',
      relationTo: [
        'restaurants',
        'restaurant-guides',
        'recipes',
        'techniques',
        'ingredients',
        'itineraries',
        'travel-guides',
      ],
      required: true,
      hasMany: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'createdAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
