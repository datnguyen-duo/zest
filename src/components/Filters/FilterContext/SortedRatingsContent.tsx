import { useSortedRatings } from '@/components/Filters/hooks/useFilteredContent'
import { SortRatings } from '@/components/Filters/SortRatings'
import { CommentDisplay } from '@/components/Comments/CommentDisplay'
import { FaStar } from 'react-icons/fa'
import type { Comment } from '@/payload-types'
import { CreateCommentData } from '@/components/Comments/types'
import { CardData } from '@/components/Card'
import { toast } from 'react-hot-toast'
import { useCreateComment } from '@/components/Comments/hooks/useCreateComment'
import { LikeButton } from '@/components/LikeButton'
import { SaveButton } from '@/components/SaveButton'
import { useEffect, useState } from 'react'
import { auth } from '@/firebase.config'
import { useDeleteComment } from '@/components/Comments/hooks/useDeleteComment'
import { CommentDisplaySkeleton } from '@/components/Comments/CommentDisplay/CommentDisplaySkeleton'
import Favicon from '@/components/Logo/Favicon'
import Spinner from '@/components/ui/spinner'
interface SortedRatingsContentProps {
  comments: Comment[]
  isLoading?: boolean
  hasMore: boolean
  loadMore: () => void
  isFetching: boolean
  totalRatings: number
}

export const SortedRatingsContent = ({
  comments,
  isLoading,
  hasMore,
  loadMore,
  isFetching,
  totalRatings,
}: SortedRatingsContentProps) => {
  const { createComment, isSubmitting } = useCreateComment()
  const { deleteComment, isDeleting } = useDeleteComment()
  const [editedComments, setEditedComments] = useState(comments)
  const sortedRatings = useSortedRatings(editedComments)
  const user = auth.currentUser

  useEffect(() => {
    setEditedComments(comments)
  }, [comments])

  const handleSave = async (data: CreateCommentData) => {
    const updatedComment = await createComment(data)
    const isRatingOnlyUpdate = !data.comment.trim() && typeof data.rating === 'number'

    if (updatedComment) {
      setEditedComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === updatedComment.id ? updatedComment : comment,
        ),
      )
      if (isRatingOnlyUpdate) {
        toast.success('Rating updated!')
      } else {
        toast.success('Comment updated!')
      }
    }
  }

  const handleDelete = async (commentId: number) => {
    try {
      const commentToDelete = editedComments.find((comment) => comment.id === commentId)

      if (!commentToDelete) {
        toast.error('Comment not found')
        return
      }

      if (commentToDelete.firebaseUID !== user?.uid) {
        toast.error('You can only delete your own comments')
        return
      }

      await deleteComment(commentId)

      setEditedComments((prevComments) =>
        prevComments.filter((comment) => comment.id !== commentId),
      )

      toast.success('Comment deleted successfully')
    } catch (error) {
      console.error('Error in handleDelete:', error)
      toast.error('Failed to delete comment')
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FaStar className="text-sm" />
          <span className="text-sm">
            {totalRatings} Rating{totalRatings !== 1 && 's'}
          </span>
        </div>
        <SortRatings />
      </div>
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <CommentDisplaySkeleton key={i} />
          ))}
        </div>
      ) : sortedRatings.length === 0 ? (
        <p className="text-center text-gray-500">No ratings yet</p>
      ) : (
        <>
          <ul className="space-y-4">
            {sortedRatings.map((comment) => (
              <li key={comment.id}>
                {comment.post ? (
                  <CommentDisplay
                    title={(comment.post.value as CardData).title}
                    comment={comment}
                    doc={comment.post.value as CardData}
                    collectionType={comment.post.relationTo}
                    rating={comment.rating}
                    onSave={handleSave}
                    isSubmitting={isSubmitting}
                    onDelete={() => handleDelete(comment.id)}
                    isDeleting={isDeleting}
                    actions={
                      <>
                        <LikeButton
                          collectionType={comment.post.relationTo}
                          postId={(comment.post.value as CardData).id}
                        />
                        <SaveButton
                          collectionType={comment.post.relationTo}
                          postId={(comment.post.value as CardData).id}
                        />
                      </>
                    }
                  />
                ) : (
                  <div className="relative grid grid-cols-9 gap-10 rounded-lg p-4 bg-gray-100 mb-4">
                    <div className="relative col-span-2 self-start">
                      <div className="w-full  rounded-lg aspect-square p-10">
                        <Favicon color="black" />
                      </div>
                    </div>
                    <div className="col-span-7 flex flex-col gap-8">
                      <p>Post has been moved or deleted.</p>
                      <button className="text-sm">
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="bg-black text-white px-4 py-2 rounded-full"
                        >
                          Delete
                        </button>
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
          {hasMore && (
            <div className="mt-6 text-center">
              <button
                onClick={loadMore}
                disabled={isFetching}
                className="px-4 py-2 text-sm border rounded-full hover:bg-gray-50 disabled:opacity-50"
              >
                {isFetching ? <Spinner /> : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </>
  )
}
