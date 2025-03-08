import { useMemo } from 'react'
import { useFilters } from '@/components/Filters/hooks/useFilters'
import type { Collection } from '@/components/Filters/FilterContext/types'
import type { CardData } from '@/components/Card' // Your Payload types
import type { Collection as UseCollection } from '@/hooks/useCollections'
import type { Comment } from '@/payload-types'

export const useFilteredContent = (items: CardData[]) => {
  const { activeCollections } = useFilters()

  const filteredItems = useMemo(() => {
    if (activeCollections.length === 0) {
      return items // Show all if no filters
    }

    return items.filter((item) => activeCollections.includes(item.collectionType as Collection))
  }, [items, activeCollections])

  return {
    filteredItems,
    totalItems: filteredItems.length,
  }
}

export const useSortedCollections = (collections: UseCollection[]) => {
  const { activeSort } = useFilters()

  return useMemo(() => {
    if (!collections) return []

    const sorted = [...collections]

    switch (activeSort) {
      case 'newest':
        return sorted.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
      case 'alphabetical':
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
      default:
        // Default to your existing sort (by updatedAt)
        return sorted.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        )
    }
  }, [collections, activeSort])
}

export const useSortedRatings = (comments: Comment[]) => {
  const { activeSort } = useFilters()

  return useMemo(() => {
    if (!comments) return []

    // Filter for comments with ratings
    const ratedComments = comments.filter(
      (comment): comment is Comment & { rating: number } =>
        comment.rating !== null && comment.rating !== undefined,
    )

    const sorted = [...ratedComments]

    switch (activeSort) {
      case 'highest':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0))

      case 'newest':
        return sorted.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )

      case 'alphabetical':
        return sorted.sort((a, b) => {
          const getPostTitle = (post: Comment['post']) => {
            if (typeof post.value === 'object' && post.value !== null) {
              return 'title' in post.value ? post.value.title || '' : ''
            }
            return ''
          }

          return getPostTitle(a.post).localeCompare(getPostTitle(b.post))
        })

      default:
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    }
  }, [comments, activeSort])
}
