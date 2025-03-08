import React, { createContext, useContext, useReducer } from 'react'
import type { FilterState, FilterAction, FilterContextType } from './types'

const initialState: FilterState = {
  collections: [],
  sort: 'newest',
}

function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case 'SET_COLLECTION_FILTER':
      return {
        ...state,
        collections: action.payload,
      }
    case 'SET_SORT':
      return {
        ...state,
        sort: action.payload,
      }
    case 'RESET_FILTERS':
      return initialState
    default:
      return state
  }
}

const FilterContext = createContext<FilterContextType | undefined>(undefined)

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(filterReducer, initialState)

  return <FilterContext.Provider value={{ state, dispatch }}>{children}</FilterContext.Provider>
}

export function useFilterContext() {
  const context = useContext(FilterContext)
  if (context === undefined) {
    throw new Error('useFilterContext must be used within a FilterProvider')
  }
  return context
}
