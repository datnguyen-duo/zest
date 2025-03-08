import { useState, useEffect } from 'react'
import type { PaginatedComments } from '../types'

interface UseCommentsProps {
  postId: number
  postTitle: string
  collectionType: string
  initialComments?: PaginatedComments
  page?: number
  limit?: number
}

export const useComments = ({
  postId,
  postTitle,
  collectionType,
  initialComments,
  page = 1,
  limit = 10,
}: UseCommentsProps) => {
  const [comments, setComments] = useState<PaginatedComments | undefined>(initialComments)
  const [isLoading, setIsLoading] = useState(!initialComments?.docs?.length)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(
          `/api/comments?postId=${postId}&collectionType=${collectionType}`,
        )
        if (!response.ok) throw new Error('Failed to fetch comments')
        const data = await response.json()
        setComments(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching comments')
      } finally {
        setIsLoading(false)
      }
    }

    if (!initialComments?.docs?.length || page > 1) {
      fetchComments()
    }
  }, [postId, collectionType, initialComments, postTitle, page, limit])

  const loadMore = () => {
    console.log('load more')
  }
  return {
    comments,
    isLoading,
    error,
    setComments,
    loadMore,
    hasMore: comments?.hasNextPage || false,
  }
}
