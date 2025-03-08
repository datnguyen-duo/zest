import React from 'react'
import { useFilters } from '@/components/Filters/hooks/useFilters'
import { cn } from '@/utilities/cn'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'highest', label: 'Highest' },
  { value: 'alphabetical', label: 'A-Z' },
] as const

export const SortRatings: React.FC = () => {
  const { activeSort, setSort } = useFilters()

  return (
    <div className="flex items-center gap-2">
      <p className="text-sm leading-none">Sort by</p>
      {SORT_OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => setSort(value)}
          className={cn(
            'text-sm leading-none cursor-pointer border rounded-full px-4 py-1 transition-colors',
            activeSort === value
              ? 'bg-black text-white border-black'
              : 'border-gray-200 hover:bg-gray-200',
          )}
          aria-pressed={activeSort === value}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
