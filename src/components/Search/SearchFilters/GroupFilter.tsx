import { cn } from '@/utilities/cn'
import { FilterGroup, FilterGroupId } from '../types'

interface GroupFilterProps {
  groups: FilterGroup[]
  selectedGroup: FilterGroupId | null
  onGroupSelect: (groupId: FilterGroupId | null) => void
}

export function GroupFilter({ groups, selectedGroup, onGroupSelect }: GroupFilterProps) {
  return (
    <div className="flex gap-2">
      {groups.map((group) => {
        const Icon = group.icon
        return (
          <button
            key={group.id}
            onClick={() => onGroupSelect(selectedGroup === group.id ? null : group.id)}
            className={cn(
              'px-3 py-1.5 text-sm rounded-full transition-colors flex items-center gap-2',
              selectedGroup === group.id
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700',
            )}
          >
            <Icon className="w-4 h-4" />
            {group.label}
          </button>
        )
      })}
    </div>
  )
}
