import { useState, useEffect } from 'react'
import type { Comment } from '@/payload-types'

interface UserContent {
  comments: Comment[]
  isLoading: boolean
  error: Error | null
  hasMore: boolean
  loadMore: () => void
  isFetchingMore: boolean
  totalComments: number
}

export const useUserContent = (firebaseUID: string | undefined, limit: number = 8) => {
  const [page, setPage] = useState(1)
  const [data, setData] = useState<UserContent>({
    comments: [],
    isLoading: true,
    error: null,
    hasMore: false,
    loadMore: () => setPage((p) => p + 1),
    isFetchingMore: false,
    totalComments: 0,
  })

  useEffect(() => {
    const fetchUserContent = async () => {
      if (!firebaseUID) return

      try {
        const response = await fetch(
          `/api/comments?where[firebaseUID][equals]=${firebaseUID}&limit=${limit}&page=${page}`,
        )
        if (!response.ok) throw new Error('Failed to fetch user content')

        const result = await response.json()

        setData((prev) => ({
          comments: page === 1 ? result.docs : [...prev.comments, ...result.docs],
          isLoading: false,
          error: null,
          hasMore: result.hasNextPage,
          loadMore: () => setPage((p) => p + 1),
          isFetchingMore: false,
          totalComments: result.totalDocs,
        }))
      } catch (error) {
        setData((prev) => ({
          ...prev,
          isLoading: false,
          error: error as Error,
          isFetchingMore: false,
        }))
      }
    }

    if (page === 1) {
      fetchUserContent()
    } else {
      setData((prev) => ({ ...prev, isFetchingMore: true }))
      fetchUserContent()
    }
  }, [firebaseUID, page, limit])

  return data
}
