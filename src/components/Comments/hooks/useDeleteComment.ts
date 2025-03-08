import { useState } from 'react'

export const useDeleteComment = () => {
  const [isDeleting, setIsDeleting] = useState(false)

  const deleteComment = async (commentId: number): Promise<void> => {
    try {
      setIsDeleting(true)

      const response = await fetch(`/api/comments?[id][in]=${commentId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(`Failed to delete comment: ${JSON.stringify(data)}`)
      }
    } catch (error) {
      console.error('Delete error details:', error)
      throw error
    } finally {
      setIsDeleting(false)
    }
  }

  return { deleteComment, isDeleting }
}
