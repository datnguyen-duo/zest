import { useInfiniteQuery } from '@tanstack/react-query'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase.config'
import { PaginatedResponse } from '@/components/Filters/hooks/useFilters/types'

export function useLikedPosts(userId: NonNullable<string>) {
  return useInfiniteQuery({
    queryKey: ['likedPosts', userId],
    queryFn: async ({ pageParam = 1 }) => {
      const userRef = doc(db, 'users', userId)
      const userDoc = await getDoc(userRef)

      if (!userDoc.exists()) {
        return {
          docs: [],
          hasNextPage: false,
          nextPage: null,
          totalDocs: 0,
        }
      }

      const likedPosts = userDoc.data()?.likedPosts || []

      const groupedPosts = likedPosts.reduce(
        (acc, post) => {
          const { collectionType, postId } = post
          if (!acc[collectionType]) {
            acc[collectionType] = []
          }
          acc[collectionType].push(postId)
          return acc
        },
        {} as Record<string, number[]>,
      )

      const fetchPromises = Object.entries(groupedPosts).map(([collectionType, postIds]) =>
        fetch('/api/getPosts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            postIds,
            collectionType,
            page: pageParam,
            limit: 8,
          }),
        }).then((res) => res.json()),
      )

      const results = await Promise.all(fetchPromises)
      return results.reduce(
        (acc, curr: PaginatedResponse) => ({
          docs: [...acc.docs, ...curr.docs],
          hasNextPage: acc.hasNextPage || curr.hasNextPage,
          nextPage: curr.hasNextPage ? pageParam + 1 : null,
          totalDocs: acc.totalDocs + curr.totalDocs,
        }),
        { docs: [], hasNextPage: false, nextPage: 0, totalDocs: 0 } as PaginatedResponse,
      )
    },
    enabled: Boolean(userId),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
  })
}
