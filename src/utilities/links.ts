import type {
  Page,
  Restaurant,
  RestaurantGuide,
  Recipe,
  Technique,
  Ingredient,
  Itinerary,
  TravelGuide,
} from '@/payload-types'

// Define the collections that can be linked to
type SupportedCollections = {
  pages: Page
  restaurants: Restaurant
  'restaurant-guides': RestaurantGuide
  recipes: Recipe
  techniques: Technique
  ingredients: Ingredient
  itineraries: Itinerary
  'travel-guides': TravelGuide
}

type RelationshipField<T extends keyof SupportedCollections = keyof SupportedCollections> = {
  relationTo: T
  value: SupportedCollections[T] | number // Add number as possible value type
}

export const getRelationshipLink = (relationship: RelationshipField | undefined): string => {
  if (!relationship?.value) return '/'

  const { relationTo, value } = relationship

  // Handle case where value is just an ID (not populated)
  if (typeof value === 'number') return '/'

  // Now TypeScript knows value has a slug property
  const { slug } = value

  // Handle home page
  if (slug === 'home') return '/'

  // Handle pages without the /pages prefix
  if (relationTo === 'pages') return `/${slug}`

  // Handle all other cases
  return `/${relationTo}/${slug}`
}
