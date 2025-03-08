import { useCallback } from 'react'
import { useFilterContext } from '@/components/Filters/FilterContext'
import type { Collection, SortOption } from '@/components/Filters/FilterContext/types'
import type { UseFiltersReturn, FilterOptions } from './types'

export const useFilters = (options: FilterOptions = {}): UseFiltersReturn => {
  const { state, dispatch } = useFilterContext()
  const { syncURL = true, defaultCollections = [] } = options

  // Toggle collection filter
  const toggleCollection = useCallback(
    (collection: Collection) => {
      const isActive = state.collections.includes(collection)
      const newCollections = isActive
        ? state.collections.filter((c) => c !== collection)
        : [...state.collections, collection]

      dispatch({
        type: 'SET_COLLECTION_FILTER',
        payload: newCollections,
      })

      // URL sync logic can be added here
    },
    [state.collections, dispatch],
  )

  // Check if collection is active
  const isCollectionActive = useCallback(
    (collection: Collection) => {
      return state.collections.includes(collection)
    },
    [state.collections],
  )

  const setSort = useCallback(
    (sort: SortOption) => {
      dispatch({ type: 'SET_SORT', payload: sort })
    },
    [dispatch],
  )

  // Reset all filters
  const resetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' })
    // URL reset logic can be added here
  }, [dispatch])

  return {
    activeCollections: state.collections,
    toggleCollection,
    isCollectionActive,
    resetFilters,
    activeSort: state.sort,
    setSort,
  }
}
