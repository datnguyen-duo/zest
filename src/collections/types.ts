import type { Config } from '@/payload-types'

// Define valid content collections
export type ContentCollection = Extract<
  keyof Config['collections'],
  | 'restaurants'
  | 'restaurant-guides'
  | 'recipes'
  | 'techniques'
  | 'ingredients'
  | 'travel-guides'
  | 'itineraries'
>

// Type for document from any content collection
export type ContentDocument = Config['collections'][ContentCollection]
