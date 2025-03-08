import React from 'react'
import { useFilters } from '@/components/Filters/hooks/useFilters'
import type { Collection } from '@/components/Filters/FilterContext/types'
import { cn } from '@/utilities/cn'

interface FilterButtonProps {
  collection: Collection
  label: string
  className?: string
}

export const FilterButton: React.FC<FilterButtonProps> = ({ collection, label, className }) => {
  const { toggleCollection, isCollectionActive } = useFilters()
  const isActive = isCollectionActive(collection)

  return (
    <button
      onClick={() => toggleCollection(collection)}
      className={cn(
        'text-sm leading-none cursor-pointer border rounded-full px-4 py-1 transition-colors',
        isActive ? 'bg-black text-white border-black' : 'border-gray-200 hover:bg-gray-200',
        className,
      )}
      aria-pressed={isActive}
    >
      {label}
    </button>
  )
}
