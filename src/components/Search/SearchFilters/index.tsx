import { cn } from '@/utilities/cn'
import { useSearchModal } from '@/contexts/SearchContext'
import { GroupFilter } from './GroupFilter'
import { TagFilter } from './TagFilter'
import { FILTER_GROUPS, FilterGroup, CollectionType, FilterGroupId } from '../types'

interface SearchFiltersProps {
  className?: string
  availableCollections: CollectionType[]
}

export function SearchFilters({ className, availableCollections }: SearchFiltersProps) {
  const { selectedGroup, setSelectedGroup } = useSearchModal()

  // Filter FILTER_GROUPS to only show groups that have matching collections
  const availableGroups: FilterGroup[] = FILTER_GROUPS.filter((group) =>
    group.collections.some((collection) => availableCollections.includes(collection)),
  )

  // Don't render if we only have one or zero groups
  if (availableGroups.length <= 1) {
    return null
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-col gap-2 mb-4">
        {/* Group filters */}
        <div className="flex-shrink-0">
          <GroupFilter
            groups={availableGroups}
            selectedGroup={selectedGroup as FilterGroupId}
            onGroupSelect={setSelectedGroup}
          />
        </div>
        {/* Tag filters - only show when a group is selected */}
        {selectedGroup && <TagFilter selectedGroup={selectedGroup as FilterGroupId} />}
      </div>
    </div>
  )
}
