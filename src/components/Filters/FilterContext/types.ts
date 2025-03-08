export type Collection = 'restaurants' | 'flavor' | 'travel'
export type SortOption = 'newest' | 'alphabetical' | 'highest'

export interface FilterState {
  collections: Collection[]
  sort: SortOption
}

export type FilterAction =
  | { type: 'SET_COLLECTION_FILTER'; payload: Collection[] }
  | { type: 'SET_SORT'; payload: SortOption }
  | { type: 'RESET_FILTERS' }
// We can add more actions here later

export interface FilterContextType {
  state: FilterState
  dispatch: React.Dispatch<FilterAction>
}
