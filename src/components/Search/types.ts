import { FiBook, FiMapPin, FiCoffee } from 'react-icons/fi'
import type { IconType } from 'react-icons'

// Collection Types
export type CollectionType =
  | 'restaurants'
  | 'restaurant-guides'
  | 'recipes'
  | 'ingredients'
  | 'techniques'
  | 'itineraries'
  | 'travel-guides'

// Search Result Type
export interface SearchResult {
  id: number
  title: string
  slug: string
  collectionType: CollectionType
  filters?: Record<string, string | string[]>
}

// Filter Groups
export const FILTER_GROUPS = [
  {
    id: 'restaurants',
    label: 'Restaurants',
    icon: FiCoffee,
    collections: ['restaurants', 'restaurant-guides'] as CollectionType[],
  },
  {
    id: 'flavor',
    label: 'Flavor',
    icon: FiBook,
    collections: ['recipes', 'ingredients', 'techniques'] as CollectionType[],
  },
  {
    id: 'travel',
    label: 'Travel',
    icon: FiMapPin,
    collections: ['itineraries', 'travel-guides'] as CollectionType[],
  },
] as const

// Filter Options
export interface FilterOption {
  id: string
  slug: string
  title: string
  multiple: boolean
}

export interface FilterOptionValue {
  id: number
  title: string
  slug: string
}

// Update AvailableFilters type
export type AvailableFilters = Record<string, FilterOptionValue[]>

// Update SearchResponse type
export interface SearchResponse {
  docs: SearchResult[]
  availableFilters: AvailableFilters
}

export const TAG_FILTERS_BY_GROUP: Record<string, FilterOption[]> = {
  restaurants: [
    {
      id: 'priceLevel',
      slug: 'priceLevel',
      title: 'Price',
      multiple: false,
    },
    {
      id: 'cuisine',
      slug: 'cuisine',
      title: 'Cuisine',
      multiple: true,
    },

    {
      id: 'moods',
      slug: 'moods',
      title: 'Mood',
      multiple: true,
    },

    {
      id: 'destination',
      slug: 'destination',
      title: 'Location',
      multiple: false,
    },
  ],
  flavor: [
    {
      id: 'mealType',
      slug: 'mealType',
      title: 'Meal Type',
      multiple: true,
    },

    {
      id: 'occasion',
      slug: 'occasion',
      title: 'Occasion',
      multiple: true,
    },

    {
      id: 'diet',
      slug: 'diet',
      title: 'Diet',
      multiple: true,
    },

    {
      id: 'difficultyLevel',
      slug: 'difficultyLevel',
      title: 'Difficulty',
      multiple: false,
    },
  ],

  travel: [
    {
      id: 'travelStyle',
      slug: 'travelStyle',
      title: 'Style',
      multiple: true,
    },

    {
      id: 'region',
      slug: 'region',
      title: 'Region',
      multiple: false,
    },

    {
      id: 'environment',
      slug: 'environment',
      title: 'Environment',
      multiple: false,
    },
  ],
}

// Helper Types
export type FilterGroup = {
  id: string
  label: string
  icon: IconType
  collections: CollectionType[]
}
export type FilterGroupId = FilterGroup['id']
export type CollectionsByGroup = Record<FilterGroupId, CollectionType[]>
export type FilterValue = string | string[]
export type FilterState = Record<string, FilterValue>

// Icon Helper
export const getCollectionIcon = (type: CollectionType): IconType => {
  switch (type) {
    case 'restaurants':
    case 'restaurant-guides':
      return FiCoffee
    case 'recipes':
    case 'ingredients':
    case 'techniques':
      return FiBook
    case 'itineraries':
    case 'travel-guides':
      return FiMapPin
  }
}
