'use client'

import { useParams } from 'next/navigation'
import { ShareButton } from '@/components/ShareButton'
import { useCollections } from '@/hooks/useCollections'
import { CollectionDetailSkeleton } from '@/components/Collections/CollectionDetailSkeleton'
import { FilterProvider } from '@/components/Filters/FilterContext'
import { FilteredContent } from '@/components/Filters/FilterContext/FilteredContent'
import { useState, useEffect, useCallback } from 'react'

export default function SharedCollectionPage() {
  const { id } = useParams()
  const { useCollection } = useCollections()
  const { data: collection } = useCollection(id as string, true)
  const [collectionPosts, setCollectionPosts] = useState([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [isLoadingPosts, setIsLoadingPosts] = useState(false)
  const [totalPosts, setTotalPosts] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchCollectionPosts = useCallback(
    async (page = 1) => {
      if (!collection?.posts.length) return

      try {
        // Group posts by collection type
        const groupedPosts = collection.posts.reduce(
          (acc, post) => {
            if (!acc[post.collectionType]) {
              acc[post.collectionType] = []
            }
            acc[post.collectionType].push(post.id)
            return acc
          },
          {} as Record<string, number[]>,
        )

        const fetchPromises = Object.entries(groupedPosts).map(([collectionType, postIds]) =>
          fetch('/api/getPosts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              postIds,
              collectionType,
              page,
              limit: 8,
            }),
          }).then((res) => res.json()),
        )

        const results = await Promise.all(fetchPromises)
        const combinedResults = results.reduce(
          (acc, curr) => ({
            docs: [...acc.docs, ...curr.docs],
            hasNextPage: acc.hasNextPage || curr.hasNextPage,
            nextPage: Math.max(acc.nextPage || 0, curr.nextPage || 0),
            totalDocs: acc.totalDocs + curr.totalDocs,
          }),
          { docs: [], hasNextPage: false, nextPage: 1, totalDocs: 0 },
        )

        setCollectionPosts((prev) =>
          page === 1 ? combinedResults.docs : [...prev, ...combinedResults.docs],
        )
        setTotalPosts(combinedResults.totalDocs)
        setHasMore(combinedResults.hasNextPage)
        setCurrentPage(combinedResults.nextPage || 1)
      } catch (err) {
        console.error('Error fetching collection posts:', err)
      } finally {
        setIsLoadingPosts(false)
        setInitialLoading(false)
      }
    },
    [collection],
  )

  useEffect(() => {
    if (collection && !collectionPosts.length) {
      fetchCollectionPosts(1)
    }
  }, [collection, fetchCollectionPosts, collectionPosts.length])

  const loadMore = () => {
    if (hasMore && !isLoadingPosts) {
      setIsLoadingPosts(true)
      fetchCollectionPosts(currentPage)
    }
  }

  if (initialLoading) {
    return <CollectionDetailSkeleton />
  }

  if (!collection) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="p-4 rounded-lg bg-gray-50 text-gray-500">
          <p className="font-medium">Collection not found</p>
          <p className="text-sm">The collection you&apos;re looking for doesn&apos;t exist</p>
        </div>
      </div>
    )
  }

  return collection ? (
    <>
      {/* Collection Header */}
      <div className="relative mb-8 text-center h-96 flex flex-col justify-center items-center bg-gray-100">
        <h1 className="text-4xl font-bold mb-2">{collection.name}</h1>
        {collection.description && (
          <p className="text-gray-600 mb-4 text-balance max-w-2xl mx-auto">
            {collection.description}
          </p>
        )}
        <p>By {collection.ownerName}</p>
        <div className="absolute max-w-4xl w-full mx-auto bottom-4 left-0 right-0 flex items-center text-sm text-gray-500 justify-between">
          <div className="flex items-center gap-2">
            <span>Created {new Date(collection.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Last Updated {new Date(collection.updatedAt).toLocaleDateString()}</span>
            <ShareButton text={`${window.location.origin}/collections/${collection.id}`} />
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="max-w-4xl mx-auto mb-10">
        <FilterProvider>
          <FilteredContent
            totalPosts={totalPosts}
            posts={collectionPosts}
            hasMore={hasMore}
            loadMore={loadMore}
            isLoading={isLoadingPosts}
          />
        </FilterProvider>
      </div>
    </>
  ) : null
}
