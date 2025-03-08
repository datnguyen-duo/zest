import { useSortedCollections } from '@/components/Filters/hooks/useFilteredContent'
import { SortFilter } from '@/components/Filters/SortFilter'
import { FaBookmark } from 'react-icons/fa'
import { Collection, useCollections } from '@/hooks/useCollections'
import Link from 'next/link'
import { LikeButton } from '@/components/LikeButton'
import { Card } from '@/components/Card'
import { SaveButton } from '@/components/SaveButton'
import { MoreOptionsButton } from '@/components/MoreOptionsButton'

import { usePopup } from '@/contexts/PopupContext'
import { FaPlus } from 'react-icons/fa'
import Spinner from '@/components/ui/spinner'
import { CardSkeleton } from '@/components/Card/CardSkeleton'

export interface SortedCollectionContentProps {
  collections: Collection[]
  isLoading?: boolean
  hasMore: boolean
  loadMore: () => void
  isFetchingMore?: boolean
  totalCollections: number
}

export const SortedCollectionContent = ({
  collections,
  isLoading,
  hasMore,
  loadMore,
  isFetchingMore,
  totalCollections,
}: SortedCollectionContentProps) => {
  const sortedCollections = useSortedCollections(collections)
  const { useCollectionPosts } = useCollections()
  const { openCollectionPopup } = usePopup()
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FaBookmark className="text-sm" />
          <span className="text-sm">
            {totalCollections} Collection{totalCollections !== 1 && 's'}
          </span>
          <button
            onClick={() => openCollectionPopup('create')}
            className="flex items-center gap-1 text-sm leading-none cursor-pointer border rounded-full px-2 py-1 transition-colors border-gray-200 hover:bg-gray-200"
          >
            Create New <FaPlus />
          </button>
        </div>

        <SortFilter />
      </div>

      <ul className="mx-auto space-y-4">
        {isLoading && <Spinner />}
        {!isLoading &&
          sortedCollections.map((collection) => (
            <CollectionItem
              key={collection.id}
              collection={collection}
              useCollectionPosts={useCollectionPosts}
            />
          ))}
      </ul>
      {hasMore && (
        <div className="text-center mt-6">
          <button
            onClick={loadMore}
            disabled={isFetchingMore}
            className="px-4 py-2 text-sm border rounded-full hover:bg-gray-50 disabled:opacity-50"
          >
            {isFetchingMore ? <Spinner /> : 'Load More'}
          </button>
        </div>
      )}
    </>
  )
}

interface CollectionItemProps {
  collection: Collection
  useCollectionPosts: (typeof useCollections)['prototype']['useCollectionPosts']
}
const CollectionItem = ({ collection, useCollectionPosts }: CollectionItemProps) => {
  const { data: postsData, isLoading } = useCollectionPosts(collection.posts)
  // Get the docs from the posts data
  const posts = postsData?.docs || []
  const totalPosts = postsData?.totalDocs || 0

  return (
    <li key={collection.id} className="flex flex-col bg-gray-100 p-4 rounded-lg">
      <div className="flex justify-between items-start">
        <div>
          <Link href={`/dashboard/collections/${collection.id}`}>
            <h3 className="text-lg">{collection.name}</h3>
          </Link>
          {collection.description && (
            <p className="text-sm text-gray-600 mt-1">{collection.description}</p>
          )}
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-sm text-gray-500">
            Created on {new Date(collection.createdAt).toLocaleDateString()}
          </span>
          <MoreOptionsButton collectionId={collection.id} />
        </div>
      </div>

      <ul className="flex gap-4 mt-4">
        {isLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </>
        ) : !posts || (posts.length === 0 && !isLoading) ? (
          <p className="text-sm text-gray-500">No posts found</p>
        ) : (
          <>
            {posts?.slice(0, 3).map((post) => (
              <li
                key={`${post.collectionType}-${post.id}`}
                className="flex gap-3 p-3 bg-white rounded-xl flex-1 max-w-[32%]"
              >
                <Card
                  doc={post}
                  collectionType={post.collectionType || ''}
                  showTaxonomies
                  showCollectionType
                  actions={
                    <>
                      <LikeButton collectionType={post.collectionType || ''} postId={post.id} />
                      <SaveButton collectionType={post.collectionType || ''} postId={post.id} />
                    </>
                  }
                />
              </li>
            ))}
            {posts?.length > 3 && (
              <Link
                href={`/dashboard/collections/${collection.id}`}
                className="flex flex-col justify-center items-center gap-2 p-4 bg-white rounded-xl"
              >
                <p>{totalPosts} Items</p>
                <p className="text-sm text-gray-500 border border-gray-500 px-2 py-1 rounded-full hover:bg-gray-500 hover:text-white">
                  See All
                </p>
              </Link>
            )}
          </>
        )}
      </ul>
    </li>
  )
}
