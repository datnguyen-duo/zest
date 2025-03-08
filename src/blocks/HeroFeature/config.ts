import type { Block } from 'payload'

export const HeroFeature: Block = {
  slug: 'heroFeature',
  interfaceName: 'HeroFeatureBlock',
  //   imageURL: '/media/image-post3.webp',
  //   imageAltText: 'Hero Feature Preview',
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'title',
          type: 'text',
          admin: {
            width: '50%',
          },
        },
        {
          name: 'titlePosition',
          type: 'select',
          defaultValue: 'left',
          admin: {
            width: '50%',
          },
          options: [
            {
              label: 'Left',
              value: 'left',
            },
            {
              label: 'Right',
              value: 'right',
            },
          ],
        },
      ],
    },
    {
      name: 'primaryContent',
      type: 'group',
      fields: [
        {
          name: 'variation',
          type: 'select',
          defaultValue: 'static',
          options: [
            {
              label: 'Static',
              value: 'static',
            },
            {
              label: 'Slider',
              value: 'slider',
            },
          ],
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
          hasMany: false,
          required: true,
          admin: {
            condition: (_, siblingData) => siblingData?.variation === 'static',
          },
        },
        {
          name: 'posts',
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
          hasMany: true,
          required: true,
          admin: {
            condition: (_, siblingData) => siblingData?.variation === 'slider',
          },
        },
      ],
    },
    {
      name: 'secondaryContent',
      type: 'group',
      fields: [
        {
          name: 'hasHeader',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          type: 'row',
          fields: [
            {
              name: 'title',
              type: 'text',
              admin: {
                condition: (_, siblingData) => siblingData?.hasHeader,
                width: '50%',
              },
            },
            {
              name: 'link',
              type: 'relationship',
              relationTo: [
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
                condition: (_, siblingData) => siblingData?.hasHeader,
                width: '50%',
              },
            },
          ],
        },
        {
          name: 'posts',

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
          hasMany: true,
          required: true,
          minRows: 2,
          maxRows: 2,
        },
      ],
    },
  ],
}
