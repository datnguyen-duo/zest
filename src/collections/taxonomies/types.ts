import { Config } from '@/payload-types'

type CollectionKeys = keyof Config['collections']

// Group all taxonomies for easier management
export type TaxonomyType = Extract<
  CollectionKeys,
  | 'price-levels'
  | 'cuisines'
  | 'moods'
  | 'destinations'
  | 'meal-types'
  | 'occasions'
  | 'diets'
  | 'difficulty-levels'
  | 'travel-styles'
  | 'regions'
  | 'environments'
>

// Map taxonomy types to their respective interfaces
export type TaxonomyTypeMap = {
  [K in TaxonomyType]: Config['collections'][K]
}

// Helper type to get taxonomy type from string
export type TaxonomyOf<T extends TaxonomyType> = TaxonomyTypeMap[T]
