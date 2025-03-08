import { useFilteredContent } from '@/components/Filters/hooks/useFilteredContent'
import { Card } from '@/components/Card'
import { LikeButton } from '@/components/LikeButton'
import { SaveButton } from '@/components/SaveButton'
import { FaRegFile } from 'react-icons/fa'
import type { CardData } from '@/components/Card'
import { CollectionFilter } from '../CollectionFilter'
import Spinner from '@/components/ui/spinner'
import { useMemo } from 'react'

interface FilteredContentProps {
  totalPosts: number
  posts: CardData[]
  hasMore: boolean
  loadMore: () => void
  isLoading: boolean
  label?: string
  icon?: React.ReactNode
}

export const FilteredContent = ({
  totalPosts,
  posts,
  hasMore,
  loadMore,
  isLoading,
  label = 'Post',
  icon = <FaRegFile />,
}: FilteredContentProps) => {
  const { filteredItems } = useFilteredContent(posts)

  const shouldShowLoadMore = useMemo(() => {
    if (!hasMore || filteredItems.length === 0) return false

    if (filteredItems.length === posts.length) {
      return hasMore
    }

    return hasMore && filteredItems.length > 0 && filteredItems.length % 8 === 0
  }, [hasMore, filteredItems.length, posts.length])

  return (
    <>
      <div className="flex justify-between mb-4">
        <p className="flex items-center gap-2">
          {icon}
          <span className="text-sm">
            {totalPosts} {label}
            {totalPosts === 1 ? '' : 's'}
          </span>
        </p>
        <CollectionFilter />
      </div>
      <ul className="mx-auto grid gap-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {filteredItems.map((post) => (
          <li key={`${post.collectionType}-${post.id}`}>
            <Card
              title={post.title}
              showCollectionType
              doc={post}
              showDescription={false}
              collectionType={post.collectionType || ''}
              showTaxonomies={false}
              actions={
                <>
                  <LikeButton collectionType={post.collectionType || ''} postId={post.id} />
                  <SaveButton collectionType={post.collectionType || ''} postId={post.id} />
                </>
              }
            />
          </li>
        ))}
      </ul>
      {shouldShowLoadMore && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="px-4 py-2 text-sm border rounded-full hover:bg-gray-50 disabled:opacity-50"
          >
            {isLoading ? <Spinner /> : 'Load More'}
          </button>
        </div>
      )}
    </>
  )
}
