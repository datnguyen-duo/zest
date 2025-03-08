import type { Block } from 'payload'

export const Hero: Block = {
  slug: 'hero',
  interfaceName: 'HeroBlock',
  fields: [
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'variation',
      type: 'select',
      defaultValue: 'feature',
      options: [
        {
          label: 'Feature',
          value: 'feature',
        },
        {
          label: 'Slider',
          value: 'slider',
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
      minRows: 3,
      maxRows: 3,
      admin: {
        description: 'Please select 3 posts. The first will be used as the primary post.',
      },
    },
  ],
}
