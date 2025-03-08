import { useState } from 'react'
import type { Comment as CommentType } from '@/payload-types'
import { auth } from '@/firebase.config'

interface CreateCommentData {
  id?: number
  comment: string
  rating?: number
  parentId?: number
  postId: number
  collectionType: string
}

interface CreateCommentResponse extends CommentType {
  isUpdate: boolean
}

export const useCreateComment = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const createComment = async (data: CreateCommentData): Promise<CreateCommentResponse | null> => {
    setIsSubmitting(true)
    setError(null)
    try {
      const user = auth.currentUser

      if (!user) {
        throw new Error('You must be logged in to comment')
      }

      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          firebaseUID: user.uid,
          name: user.displayName || 'Anonymous',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create comment')
      }

      const result: CreateCommentResponse = await response.json()
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating comment')
      return null
    } finally {
      setIsSubmitting(false)
    }
  }

  return { createComment, isSubmitting, error }
}
