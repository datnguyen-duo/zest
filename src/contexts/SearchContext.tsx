import { FILTER_GROUPS, FilterState, SearchResult } from '@/components/Search/types'
import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react'

const RECENT_SEARCHES_KEY = 'recent-searches'
const MAX_RECENT_SEARCHES = 5

interface RecentSearch {
  title: string
  collectionType: string
  slug: string
}

interface SearchContextType {
  // Modal state
  isOpen: boolean
  openModal: () => void
  closeModal: () => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void

  // Search state
  searchTerm: string
  setSearchTerm: (term: string) => void

  // Recent searches
  recentSearches: RecentSearch[]
  addRecentSearch: (search: RecentSearch) => void
  removeRecentSearch: (title: string) => void
  clearRecentSearches: () => void

  // Group filters
  selectedGroup: string | null
  setSelectedGroup: (group: string | null) => void

  // Available filters from search results
  availableFilters: Record<string, string[]>
  setAvailableFilters: (filters: Record<string, string[]>) => void

  // Active and pending filters
  activeFilters: FilterState
  setActiveFilters: (filters: FilterState) => void
  pendingFilters: FilterState
  setPendingFilters: (filters: FilterState) => void

  // Search results
  searchResults: SearchResult[]
  setSearchResults: (results: SearchResult[]) => void
  filteredResults: SearchResult[]
  setFilteredResults: (results: SearchResult[]) => void
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

export function SearchProvider({ children }: { children: ReactNode }) {
  // Modal state
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Search state
  const [searchTerm, setSearchTerm] = useState('')

  // Recent searches
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>(getInitialRecentSearches())

  // Filter state
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [availableFilters, setAvailableFilters] = useState<Record<string, string[]>>({})
  const [activeFilters, setActiveFilters] = useState<Record<string, string | string[]>>({})
  const [pendingFilters, setPendingFilters] = useState<Record<string, string | string[]>>({})

  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([])

  const openModal = useCallback(() => {
    setIsOpen(true)
    setSearchTerm('')
    setPendingFilters({})
  }, [])

  const closeModal = useCallback(() => {
    setIsOpen(false)
    setSearchTerm('')
    setSelectedGroup(null)
    setPendingFilters({})
    setActiveFilters({})
  }, [])

  // Recent searches handlers
  const addRecentSearch = useCallback((search: RecentSearch) => {
    const trimmedTitle = search.title.trim()
    if (!trimmedTitle) return

    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.title !== trimmedTitle)
      const updated = [search, ...filtered].slice(0, MAX_RECENT_SEARCHES)
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const removeRecentSearch = useCallback((titleToRemove: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item.title !== titleToRemove)
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const clearRecentSearches = useCallback(() => {
    localStorage.removeItem(RECENT_SEARCHES_KEY)
    setRecentSearches([])
  }, [])

  const handleSearchResults = useCallback((results: SearchResult[]) => {
    setSearchResults(results)
    setFilteredResults(results)
  }, [])

  const filterResults = useCallback(() => {
    let results = searchResults

    // First apply group filter if selected
    if (selectedGroup) {
      const group = FILTER_GROUPS.find((g) => g.id === selectedGroup)
      if (group) {
        results = results.filter((result) => group.collections.includes(result.collectionType))
      }
    }

    // Then apply tag filters
    if (Object.keys(activeFilters).length > 0) {
      results = results.filter((result) => {
        return Object.entries(activeFilters).every(([filterKey, filterValue]) => {
          if (!result.filters?.[filterKey]) return false
          const resultValue = result.filters[filterKey]

          if (Array.isArray(filterValue)) {
            if (!Array.isArray(resultValue)) return false
            return filterValue.every((value) => resultValue.includes(value))
          }

          return resultValue === filterValue
        })
      })
    }

    setFilteredResults(results)
  }, [searchResults, selectedGroup, activeFilters])

  // Update filtered results whenever search results, group, or filters change
  useEffect(() => {
    filterResults()
  }, [filterResults, searchResults, selectedGroup, activeFilters])

  const handleGroupSelect = useCallback(
    (groupId: string | null) => {
      setSelectedGroup(groupId)
      setPendingFilters({}) // Reset pending tag filters
      setActiveFilters({}) // Reset active tag filters

      // Immediately filter by group
      if (!groupId) {
        setFilteredResults(searchResults)
        return
      }

      const group = FILTER_GROUPS.find((g) => g.id === groupId)
      if (!group) {
        setFilteredResults(searchResults)
        return
      }

      const filtered = searchResults.filter((result) =>
        group.collections.includes(result.collectionType),
      )
      setFilteredResults(filtered)
    },
    [searchResults],
  )

  const handleApplyTagFilters = useCallback(
    (filters: FilterState) => {
      setActiveFilters(filters)

      // Start with group-filtered results
      let results = searchResults

      // First apply group filter (since we know we have a group selected)
      if (selectedGroup) {
        const group = FILTER_GROUPS.find((g) => g.id === selectedGroup)
        if (group) {
          results = results.filter((result) => group.collections.includes(result.collectionType))
        }
      }

      // Then apply tag filters
      if (Object.keys(filters).length > 0) {
        results = results.filter((result) => {
          return Object.entries(filters).every(([filterKey, filterValue]) => {
            if (!result.filters?.[filterKey]) return false
            const resultValue = result.filters[filterKey]

            if (Array.isArray(filterValue)) {
              if (!Array.isArray(resultValue)) return false
              return filterValue.every((value) => resultValue.includes(value))
            }

            return resultValue === filterValue
          })
        })
      }

      setFilteredResults(results)
    },
    [searchResults, selectedGroup],
  )

  return (
    <SearchContext.Provider
      value={{
        // Modal state
        isOpen,
        openModal,
        closeModal,
        isLoading,
        setIsLoading,

        // Search state
        searchTerm,
        setSearchTerm,

        // Recent searches
        recentSearches,
        addRecentSearch,
        removeRecentSearch,
        clearRecentSearches,

        // Filter state
        selectedGroup,
        setSelectedGroup: handleGroupSelect, // Use the new handler instead
        availableFilters,
        setAvailableFilters,
        activeFilters,
        setActiveFilters: handleApplyTagFilters,
        pendingFilters,
        setPendingFilters,

        // Search results
        searchResults,
        setSearchResults: handleSearchResults,
        filteredResults,
        setFilteredResults,
      }}
    >
      {children}
    </SearchContext.Provider>
  )
}

// Helper function to get initial recent searches
function getInitialRecentSearches(): RecentSearch[] {
  if (typeof window === 'undefined') return []
  const saved = localStorage.getItem(RECENT_SEARCHES_KEY)
  return saved ? JSON.parse(saved) : []
}

export function useSearchModal() {
  const context = useContext(SearchContext)
  if (context === undefined) {
    throw new Error('useSearchModal must be used within a SearchProvider')
  }
  return context
}
