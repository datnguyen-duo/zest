import { useState, useRef } from 'react'
import { useSearchModal } from '@/contexts/SearchContext'
import { useClickOutside } from '@/hooks/useClickOutside'
import { cn } from '@/utilities/cn'
import Spinner from '@/components/ui/spinner'

import { FilterValue, FilterGroupId, TAG_FILTERS_BY_GROUP, FilterOptionValue } from '../types'
import { FiChevronDown } from 'react-icons/fi'

interface TagFilterProps {
  selectedGroup: FilterGroupId | null
  className?: string
}

function isFilterOptionValue(option: unknown): option is FilterOptionValue {
  return (
    typeof option === 'object' &&
    option !== null &&
    'id' in option &&
    'title' in option &&
    'slug' in option
  )
}

const FILTER_CONFIG = {
  restaurants: ['priceLevel', 'cuisine', 'moods', 'destination'],
  flavor: ['mealType', 'occasion', 'diet', 'difficultyLevel'],
  travel: ['travelStyle', 'region', 'environment'],
} as const

export function TagFilter({ selectedGroup, className }: TagFilterProps) {
  const { availableFilters, activeFilters, pendingFilters, setPendingFilters, setActiveFilters } =
    useSearchModal()
  const [isApplying, setIsApplying] = useState(false)
  const [openFilter, setOpenFilter] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Get the relevant filter types for the selected group
  const relevantFilterTypes = selectedGroup ? FILTER_CONFIG[selectedGroup] : []

  // Filter availableFilters to only show relevant ones for the selected group
  const filteredAvailableFilters = Object.fromEntries(
    Object.entries(availableFilters).filter(([key]) =>
      relevantFilterTypes.includes(key as keyof typeof availableFilters),
    ),
  )

  useClickOutside(containerRef, () => {
    setOpenFilter(null)
  })

  if (!selectedGroup) return null

  // Get available tag configurations that have matching filter values
  const availableTags = TAG_FILTERS_BY_GROUP[selectedGroup]?.filter((filter) => {
    return filteredAvailableFilters[filter.id]?.length > 0
  })

  if (!availableTags?.length) return null

  const handleTagSelect = (filterId: string, value: FilterValue) => {
    setPendingFilters({
      ...pendingFilters,
      [filterId]: value,
    })
  }

  const handleApplyFilters = async () => {
    setIsApplying(true)
    await setActiveFilters(pendingFilters)
    setIsApplying(false)
  }

  const handleClearAllFilters = async () => {
    setIsApplying(true)
    setPendingFilters({})
    await setActiveFilters({}) // Apply the empty filters
    setIsApplying(false)
  }

  const hasChanges = JSON.stringify(activeFilters) !== JSON.stringify(pendingFilters)

  return (
    <div className="flex justify-between items-center">
      <div className={cn('flex gap-2 flex-wrap', className)} ref={containerRef}>
        {availableTags.map((filter) => (
          <div key={`${filter.id}-${filter.slug}`} className="relative">
            <button
              onClick={() => setOpenFilter(openFilter === filter.id ? null : filter.id)}
              className={cn(
                'px-3 py-1.5 text-sm rounded-md border transition-colors flex items-center gap-1',
                pendingFilters[filter.id]
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-200 hover:border-gray-300',
              )}
            >
              {filter.title}
              {pendingFilters[filter.id] && (
                <span className="ml-1">
                  (
                  {Array.isArray(pendingFilters[filter.id])
                    ? (pendingFilters[filter.id] as string[]).length
                    : 1}
                  )
                </span>
              )}
              <FiChevronDown
                className={cn(
                  'w-4 h-4 transition-transform duration-200',
                  openFilter === filter.id ? 'transform rotate-180' : '',
                )}
              />
            </button>

            {openFilter === filter.id && (
              <div className="absolute z-10 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200">
                <div className="max-h-60 overflow-auto">
                  {availableFilters[filter.id]?.map((option: unknown) => {
                    if (!isFilterOptionValue(option)) return null

                    return (
                      <label
                        key={option.id}
                        className="flex items-center px-3 py-2 hover:bg-gray-50 rounded-md cursor-pointer"
                      >
                        <input
                          type={filter.multiple ? 'checkbox' : 'radio'}
                          name={filter.id}
                          value={option.slug}
                          checked={
                            filter.multiple
                              ? ((pendingFilters[filter.id] as string[]) || []).includes(
                                  option.slug,
                                )
                              : pendingFilters[filter.id] === option.slug
                          }
                          onChange={(e) => {
                            if (filter.multiple) {
                              const currentValues = (pendingFilters[filter.id] as string[]) || []
                              handleTagSelect(
                                filter.id,
                                e.target.checked
                                  ? [...currentValues, option.slug]
                                  : currentValues.filter((v) => v !== option.slug),
                              )
                            } else {
                              handleTagSelect(filter.id, option.slug)
                              setOpenFilter(null)
                            }
                          }}
                          className="mr-2"
                        />
                        {option.title}
                      </label>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2 items-center">
        <button
          onClick={handleClearAllFilters}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Clear
        </button>
        <button
          onClick={handleApplyFilters}
          className={cn(
            'px-4 py-2 text-sm bg-gray-900 text-white rounded-md hover:bg-gray-800',
            !hasChanges && 'opacity-50 cursor-not-allowed',
          )}
          disabled={!hasChanges}
        >
          {isApplying ? <Spinner /> : 'Apply'}
        </button>
      </div>
    </div>
  )
}
