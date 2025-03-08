import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchModal } from '@/contexts/SearchContext'
import { useDebounce } from '@/utilities/useDebounce'
import Link from 'next/link'
import { SearchFilters } from '../SearchFilters'
import { SearchResult, CollectionType, getCollectionIcon } from '../types'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/Card'

export type SearchResultsVariant = 'list' | 'cards'
export function SearchResults({ variant = 'list' }: { variant?: SearchResultsVariant }) {
  const router = useRouter()
  const {
    searchTerm,
    isLoading,
    setIsLoading,
    addRecentSearch,
    closeModal,
    setAvailableFilters,
    setSearchResults,
    searchResults,
    filteredResults,
  } = useSearchModal()

  const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  const resultsRef = useRef<HTMLDivElement>(null)
  const debouncedSearchTerm = useDebounce(searchTerm)

  const availableCollections = useMemo(() => {
    if (!searchResults.length) return []
    return [...new Set(searchResults.map((r) => r.collectionType))] as CollectionType[]
  }, [searchResults]) // Change dependency to searchResults

  const handleSelectResult = useCallback(
    (result: SearchResult) => {
      addRecentSearch({
        title: result.title,
        collectionType: result.collectionType,
        slug: result.slug,
      })
      closeModal()
    },
    [addRecentSearch, closeModal],
  )

  // Loading effect
  useEffect(() => {
    setIsLoading(Boolean(searchTerm))
  }, [searchTerm, setIsLoading])

  // Fetch results
  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedSearchTerm.trim()) {
        setSearchResults([])
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/search?term=${encodeURIComponent(debouncedSearchTerm)}`)
        const data = await response.json()
        setSearchResults(data.docs)
        setAvailableFilters(data.availableFilters)
      } catch (error) {
        console.error('Search error:', error)
        setSearchResults([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [debouncedSearchTerm, setIsLoading, setAvailableFilters, setSearchResults])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!filteredResults.length) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) => (prev + 1) % filteredResults.length)
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => (prev - 1 + filteredResults.length) % filteredResults.length)
          break
        case 'Enter':
          e.preventDefault()
          if (selectedIndex >= 0) {
            const selectedResult = filteredResults[selectedIndex]
            handleSelectResult(selectedResult)
            router.push(`/${selectedResult.collectionType}/${selectedResult.slug}`)
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [filteredResults, selectedIndex, handleSelectResult, router])

  // Scroll into view
  useEffect(() => {
    if (selectedIndex === -1) return

    const selectedElement = resultsRef.current?.children[selectedIndex] as HTMLElement
    if (selectedElement) {
      selectedElement.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      })
    }
  }, [selectedIndex])

  if (!debouncedSearchTerm) return null

  return (
    <div ref={resultsRef} role="listbox" id="search-results" className="w-full">
      {!isLoading && filteredResults.length > 0 ? (
        <div className="space-y-1">
          <SearchFilters availableCollections={availableCollections} />
          {variant === 'list' && (
            <div className="max-h-[60vh] overflow-auto">
              {filteredResults.map((result, index) => {
                const Icon = getCollectionIcon(result.collectionType)
                return (
                  <Link
                    key={`${result.id}-${result.collectionType}`}
                    href={`/${result.collectionType}/${result.slug}`}
                    onClick={() => handleSelectResult(result)}
                    className={`
                   flex items-center gap-3 px-4 py-2 text-sm rounded-md
                   ${index === selectedIndex ? 'bg-gray-100' : 'hover:bg-gray-50'}
                 `}
                    role="option"
                    aria-selected={index === selectedIndex}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{result.title}</span>
                  </Link>
                )
              })}
            </div>
          )}
          {variant === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredResults.map((result) => (
                <Card
                  key={`${result.id}-${result.collectionType}`}
                  doc={result}
                  collectionType={result.collectionType}
                  showCollectionType={true}
                />
              ))}
            </div>
          )}
        </div>
      ) : !isLoading && debouncedSearchTerm ? (
        <div className="p-4 text-sm text-gray-500 text-center">
          No results found for &quot;{debouncedSearchTerm}&quot;
        </div>
      ) : null}
    </div>
  )
}
