import { useState, useCallback, useEffect } from 'react'
import { FaSearch } from 'react-icons/fa'
import debounce from 'lodash/debounce'

interface SearchBarProps {
  placeholder?: string
  onSearch: (query: string) => void
  className?: string
  value?: string
  onChange?: (value: string) => void
}

export default function SearchBar({
  placeholder = 'Search...',
  onSearch,
  className = '',
  value = '',
  onChange,
}: SearchBarProps) {
  const [query, setQuery] = useState(value || '')
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    if (value !== undefined) {
      setQuery(value)
    }
  }, [value])

  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      onSearch(searchQuery)
    }, 300),
    [onSearch],
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setQuery(newValue)
    onChange?.(newValue)
    debouncedSearch(newValue)
  }

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        placeholder={placeholder}
        className="w-full px-4 py-1 pr-10 pl-4 text-gray-900 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
    </div>
  )
}
