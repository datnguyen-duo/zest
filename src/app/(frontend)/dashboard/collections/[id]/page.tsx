'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { auth } from '@/firebase.config'
import Link from 'next/link'
import { FaChevronLeft } from 'react-icons/fa'
import { ShareButton } from '@/components/ShareButton'
import { MoreOptionsButton } from '@/components/MoreOptionsButton'
import { useCollections } from '@/hooks/useCollections'
import { CollectionDetailSkeleton } from '@/components/Collections/CollectionDetailSkeleton'
import { FilterProvider } from '@/components/Filters/FilterContext'
import { FilteredContent } from '@/components/Filters/FilterContext/FilteredContent'
import { CardData } from '@/components/Card'
import { PaginatedResponse } from '@/components/Filters/hooks/useFilters/types'

export default function CollectionPage() {
  const { id } = useParams()
  const { useCollection } = useCollections()
  const { data: collection, error, refetch } = useCollection(id as string, false)

  const [collectionPosts, setCollectionPosts] = useState<CardData[]>([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [isLoadingPosts, setIsLoadingPosts] = useState(false)
  const [totalPosts, setTotalPosts] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchCollectionPosts = useCallback(
    async (page: number = 1) => {
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

        // Fetch posts for each collection type
        const fetchPromises = Object.entries(groupedPosts).map(([collectionType, postIds]) =>
          fetch('/api/getPosts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
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
          (acc, curr: PaginatedResponse) => ({
            docs: [...acc.docs, ...curr.docs],
            hasNextPage: acc.hasNextPage || curr.hasNextPage,
            nextPage: Math.max(acc.nextPage || 0, curr.nextPage || 0),
            totalDocs: acc.totalDocs + curr.totalDocs,
          }),
          { docs: [], hasNextPage: false, nextPage: 1, totalDocs: 0 } as PaginatedResponse,
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

  // Load initial posts when collection data is available
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
  if (!auth.currentUser || initialLoading) {
    return <CollectionDetailSkeleton />
  }

  if (error && auth.currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="p-4 rounded-lg bg-red-50 text-red-500">
          <p className="font-medium">Unable to load collection</p>
          <p className="text-sm">Please try again later</p>
        </div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!collection && auth.currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="p-4 rounded-lg bg-gray-50 text-gray-500">
          <p className="font-medium">Collection not found</p>
          <p className="text-sm">The collection you&apos;re looking for doesn&apos;t exist</p>
        </div>
        <Link
          href="/dashboard/collections"
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
        >
          Back to Collections
        </Link>
      </div>
    )
  }

  return collection ? (
    <>
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
            <Link href="/dashboard/collections" className="rounded-full p-2 bg-white text-black">
              <FaChevronLeft />
            </Link>
            <span>Created {new Date(collection.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Last Updated {new Date(collection.updatedAt).toLocaleDateString()}</span>
            <ShareButton text={`${window.location.origin}/collections/${collection.id}`} />
            <MoreOptionsButton collectionId={collection.id} />
          </div>
        </div>
      </div>

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
