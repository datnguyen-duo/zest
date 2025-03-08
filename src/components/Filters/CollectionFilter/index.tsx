import React from 'react'
import type { Collection } from '@/components/Filters/FilterContext/types'
import { useFilters } from '../hooks/useFilters'
import { cn } from '@/utilities/cn'

const COLLECTION_OPTIONS: Array<{ value: Collection; label: string }> = [
  { value: 'restaurants', label: 'Restaurants' },
  { value: 'flavor', label: 'Flavor' },
  { value: 'travel', label: 'Travel' },
]

interface CollectionFilterProps {
  className?: string
}

export const CollectionFilter: React.FC<CollectionFilterProps> = ({ className }) => {
  const { activeCollections, toggleCollection } = useFilters()

  return (
    <div className={className}>
      <ul className="flex items-center gap-2">
        <p className="text-sm leading-none">Filter by</p>
        {COLLECTION_OPTIONS.map(({ value, label }) => (
          <li key={value}>
            <button
              onClick={() => toggleCollection(value)}
              className={cn(
                'text-sm leading-none cursor-pointer border rounded-full px-4 py-1 transition-colors',
                activeCollections.includes(value)
                  ? 'bg-black text-white border-black'
                  : 'border-gray-200 hover:bg-gray-200',
                className,
              )}
              aria-pressed={activeCollections.includes(value)}
            >
              {label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
