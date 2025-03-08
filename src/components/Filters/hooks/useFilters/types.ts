import { CardData } from '@/components/Card'
import type { Collection, SortOption } from '@/components/Filters/FilterContext/types'

export interface UseFiltersReturn {
  activeCollections: Collection[]
  activeSort: SortOption
  toggleCollection: (collection: Collection) => void
  isCollectionActive: (collection: Collection) => boolean
  resetFilters: () => void
  setSort: (sort: SortOption) => void
}

export interface FilterOptions {
  syncURL?: boolean // Option to sync with URL params
  defaultCollections?: Collection[] // Optional default filters
}

export interface PaginatedResponse {
  docs: CardData[]
  totalDocs: number
  hasNextPage: boolean
  nextPage: number
}
