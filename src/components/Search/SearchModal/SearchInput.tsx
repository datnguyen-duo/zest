import { useEffect, useRef } from 'react'
import { useSearchModal } from '@/contexts/SearchContext'
import { FiSearch, FiX } from 'react-icons/fi'
import Spinner from '@/components/ui/spinner'
import Link from 'next/link'

export function SearchInput() {
  const {
    searchTerm,
    setSearchTerm,
    isLoading,
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
    closeModal,
  } = useSearchModal()
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus input when modal opens
  useEffect(() => {
    const timeout = setTimeout(() => {
      inputRef.current?.focus()
    }, 300) // Small delay to ensure modal transition is complete

    return () => clearTimeout(timeout)
  }, [])

  return (
    <div className="space-y-4">
      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
          }}
          placeholder="Search for anything..."
          className="w-full pl-11 pr-4 py-3 text-sm rounded-lg border focus:border-gray-300 focus:ring-0 focus:outline-none transition-colors"
          role="combobox"
          aria-expanded="true"
          aria-controls="search-results"
          aria-autocomplete="list"
        />
      </div>

      {isLoading && (
        <div className="flex justify-center items-center p-2">
          <Spinner />
        </div>
      )}

      {!searchTerm && recentSearches.length > 0 && (
        <div className="px-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-gray-500">Recent</h3>
            <button
              onClick={clearRecentSearches}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Clear all
            </button>
          </div>
          <ul className="space-y-1">
            {recentSearches.map((item, index) => (
              <li
                key={index}
                className="flex items-center group px-3 py-1.5 text-sm rounded-md hover:bg-gray-100 "
              >
                <Link
                  href={`/${item.collectionType}/${item.slug}`}
                  onClick={() => {
                    addRecentSearch({
                      title: item.title,
                      collectionType: item.collectionType,
                      slug: item.slug,
                    })
                    closeModal()
                  }}
                  className="flex-1 flex items-center gap-2"
                >
                  <FiSearch className="h-4 w-4 text-gray-400" />
                  <span>{item.title}</span>
                </Link>
                <button
                  onClick={() => removeRecentSearch(item.title)}
                  aria-label={`Remove ${item.title} from recent searches`}
                >
                  <FiX className="h-4 w-4 text-gray-400" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
