import { useEffect, useRef, useState } from 'react'
import type { Comment as CommentType } from '@/payload-types'
import { auth } from '@/firebase.config'
import RatingInput from './RatingInput'
import Spinner from '@/components/ui/spinner'
import { CardData } from '@/components/Card'
import { useCreateComment } from '../hooks/useCreateComment'
import { toast } from 'react-hot-toast'
import { useDeleteComment } from '../hooks/useDeleteComment'
import Favicon from '@/components/Logo/Favicon'

interface CommentItemProps {
  comment: CommentType
  replies: CommentType[]
  onReply?: (commentId: number) => void
  depth: number
  maxDepth: number
}

export default function CommentItem({
  comment,
  replies,
  onReply,
  depth = 0,
  maxDepth = 2,
}: CommentItemProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const canReply = depth < maxDepth && onReply
  const hasReplies = replies.length > 0
  const user = auth.currentUser
  const [isEditing, setIsEditing] = useState(false)
  const [editedComment, setEditedComment] = useState(comment.comment || '')
  const [editedRating, setEditedRating] = useState(comment.rating || 0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isSavingRef = useRef(false)
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { createComment, isSubmitting } = useCreateComment()
  const { deleteComment } = useDeleteComment()

  const handleSubmit = async () => {
    if (isSavingRef.current) return
    console.log(comment.parentId)
    try {
      isSavingRef.current = true
      await createComment({
        id: comment.id,
        parentId: comment.parentId as number | undefined,
        comment: editedComment.trim(),
        rating: editedRating,
        postId: (comment.post.value as CardData).id,
        collectionType: comment.post.relationTo,
      })
    } catch (error) {
      console.error('Error saving comment:', error)
    } finally {
      isSavingRef.current = false
      setIsEditing(false)
      toast.success('Comment updated!')
    }
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await deleteComment(comment.id)
      toast.success('Comment deleted!')
      setIsDeleteConfirmationOpen(false)
    } catch (error) {
      console.error('Error deleting comment:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      const length = textareaRef.current.value.length
      textareaRef.current.setSelectionRange(length, length)
    }
  }, [isEditing])

  return (
    <>
      <div className={`${depth > 0 ? 'ml-6 mt-4' : ''}`}>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          {/* Comment Header */}

          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-medium text-gray-900">{comment.name}</h4>
              <p className="text-sm text-gray-500">
                {new Date(comment.createdAt).toLocaleDateString()}
              </p>
            </div>
            {comment.rating && !isEditing && (
              <RatingInput
                value={comment.rating as number}
                onChange={() => {}}
                size="sm"
                className="pointer-events-none"
              />
            )}
          </div>

          {/* Comment Content */}
          <div className="space-y-2">
            {isEditing ? (
              <>
                {comment.rating && (
                  <RatingInput value={editedRating} onChange={setEditedRating} size="sm" />
                )}
                <textarea
                  ref={textareaRef}
                  value={editedComment}
                  onChange={(e) => setEditedComment(e.target.value)}
                  className="w-full p-2 border rounded-md outline-none"
                  rows={3}
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    className="text-sm"
                    onClick={() => {
                      setEditedRating(comment.rating || 0)
                      setEditedComment(comment.comment || '')
                      setIsEditing(false)
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="text-sm bg-black text-white px-4 py-1 rounded-full"
                  >
                    {isSubmitting && isSavingRef.current ? (
                      <Spinner className="w-4 h-4" />
                    ) : (
                      'Submit'
                    )}
                  </button>
                </div>
              </>
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap">{comment.comment}</p>
            )}
          </div>

          {/* Comment Actions */}
          <div className="mt-2 flex items-center gap-4">
            {canReply && user && user.uid !== comment.firebaseUID && (
              <button
                onClick={() => onReply(comment.id)}
                className="text-sm text-midnightGreen hover:underline"
              >
                Reply
              </button>
            )}
            {user && user.uid === comment.firebaseUID && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sm text-midnightGreen hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => setIsDeleteConfirmationOpen(true)}
                  className="text-sm text-midnightGreen hover:underline"
                >
                  Delete
                </button>
              </>
            )}

            {hasReplies && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                {isExpanded
                  ? 'Hide Replies'
                  : `Show Replies (${replies.length + (comment.adminReply ? 1 : 0)})`}
              </button>
            )}
          </div>
        </div>

        {/* Replies */}
        {isExpanded && (hasReplies || comment.adminReply) && (
          <div className="space-y-4">
            {comment.adminReply && (
              <div className="ml-6 mt-4 p-4 border-schoolBusYellow border rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-auto">
                    <Favicon color="#FADD24" />
                  </div>
                  <p className="text-midnightGreen font-medium ">Zest</p>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{comment.adminReply}</p>
              </div>
            )}

            {replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                replies={[]} // Assuming we don't want to show nested replies
                onReply={onReply}
                depth={depth + 1}
                maxDepth={maxDepth}
              />
            ))}
          </div>
        )}
      </div>

      {isDeleteConfirmationOpen && (
        <div
          className="overlay flex items-center justify-center"
          onClick={() => setIsDeleteConfirmationOpen(false)}
        >
          <div
            className="bg-white rounded-lg pb-6 pt-12 px-6 w-full max-w-md relative z-50 text-secondary popup-enter"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsDeleteConfirmationOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h1 className="text-2xl font-bold mb-4 text-center">Delete Comment</h1>
            <p className="text-sm text-gray-600 mb-2 text-center">
              Are you sure you want to delete this comment?
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <button onClick={handleDelete} className="bg-black text-white px-4 py-2 rounded-full">
                {isDeleting ? <Spinner /> : 'Delete'}
              </button>
              <button onClick={() => setIsDeleteConfirmationOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
