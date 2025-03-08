import { Field } from 'payload'

export const searchFields: Field[] = [
  {
    name: 'slug',
    type: 'text',
    index: true,
    admin: {
      readOnly: true,
    },
  },
  {
    name: 'meta',
    label: 'Meta',
    type: 'group',
    index: true,
    admin: {
      readOnly: true,
    },
    fields: [
      {
        type: 'text',
        name: 'title',
        label: 'Title',
      },
      {
        type: 'text',
        name: 'description',
        label: 'Description',
      },
    ],
  },
  {
    name: 'featuredImage',
    label: 'Featured Image',
    type: 'upload',
    relationTo: 'media',
    admin: {
      readOnly: true,
    },
  },
  {
    name: 'collectionType',
    label: 'Collection Type',
    type: 'select',
    options: [
      'pages',
      'restaurants',
      'restaurant-guides',
      'recipes',
      'techniques',
      'ingredients',
      'itineraries',
      'travel-guides',
    ],
    admin: {
      readOnly: true,
    },
  },
]
