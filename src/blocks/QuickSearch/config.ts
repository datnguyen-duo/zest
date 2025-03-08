import type { Block } from 'payload'

export const QuickSearch: Block = {
  slug: 'quick-search',
  fields: [
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'searchQuery',
      type: 'text',
    },
  ],
}
