import Spinner from '@/components/ui/spinner'

interface SearchResultItem {
  id: number
  collectionType: string
  postUri: string
  title: string
}

interface SearchResultsProps {
  results: SearchResultItem[]
  isLoading: boolean
  query?: string
  onResultClick?: (result: SearchResultItem) => void
  renderItem?: (result: SearchResultItem) => React.ReactNode
  onClose?: () => void
}

export default function SearchResults({
  results,
  isLoading,
  query = '',
  onResultClick,
  renderItem,
  onClose,
}: SearchResultsProps) {
  // Show the component if we're loading, have results, or have an active search
  const shouldShow = isLoading || results.length > 0 || query.trim().length > 0
  if (!shouldShow) return null

  const handleResultClick = (e: React.MouseEvent, result: SearchResultItem) => {
    e.stopPropagation()
    onResultClick?.(result)
    onClose?.()
  }
  return (
    <div className="search-results absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border p-2 max-h-[300px] overflow-y-auto">
      {isLoading ? (
        <div className="flex justify-center p-4">
          <Spinner className="w-6 h-6" />
        </div>
      ) : results.length > 0 ? (
        <ul className="space-y-2">
          {results.map((result) => (
            <li
              key={`${result.collectionType}-${result.id}`}
              onClick={(e) => handleResultClick(e, result)}
              className="p-2 hover:bg-gray-100 rounded cursor-pointer"
            >
              {renderItem ? renderItem(result) : null}
            </li>
          ))}
        </ul>
      ) : query.trim().length > 0 ? (
        <div className="text-center py-4 text-gray-500">No matching results found</div>
      ) : null}
    </div>
  )
}
