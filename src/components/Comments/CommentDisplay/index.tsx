import { useEffect, useRef, useState } from 'react'
import { CardData } from '@/components/Card'
import { Comment } from '@/payload-types'
import RatingInput from '@/components/Comments/CommentSection/RatingInput'
import Link from 'next/link'
import { Media } from '@/components/Media'
import { CreateCommentData } from '../types'
import Spinner from '@/components/ui/spinner'

interface CommentDisplayProps {
  comment: Comment
  title?: string
  doc: CardData
  collectionType: string
  rating: number | null | undefined
  showCategories?: boolean
  isDeleting?: boolean
  actions?: React.ReactNode
  onSave: (data: CreateCommentData) => Promise<void>
  onDelete: (commentId: number) => Promise<void>
  isSubmitting?: boolean
}

export const CommentDisplay = ({
  comment,
  title: titleFromProps,
  collectionType,
  rating,
  actions,
  onSave,
  onDelete,
  isSubmitting,
  isDeleting,
}: CommentDisplayProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedComment, setEditedComment] = useState(comment.comment || '')

  const [editedRating, setEditedRating] = useState(comment.rating || 0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isSavingRef = useRef(false)
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false)

  const { slug, title, featuredImage } = (comment.post.value as CardData) || {}
  const titleToUse = titleFromProps || title
  const href = `/${collectionType}/${slug}`

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      const length = textareaRef.current.value.length
      textareaRef.current.setSelectionRange(length, length)
    }
  }, [isEditing])

  const handleSubmit = async () => {
    if (isSavingRef.current) return // Prevent double submission

    try {
      isSavingRef.current = true
      await onSave({
        comment: editedComment.trim(),
        rating: editedRating,
        postId: (comment.post.value as CardData).id,
        collectionType,
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving comment:', error)
    } finally {
      isSavingRef.current = false
    }
  }

  const handleDelete = async () => {
    await onDelete(comment.id)
  }

  return (
    <>
      <article className="relative grid grid-cols-9 gap-10 rounded-lg p-4 bg-gray-100">
        <div className="relative col-span-2 self-start">
          {!featuredImage && <div className="">No image</div>}
          {featuredImage && typeof featuredImage !== 'string' && (
            <Link href={href}>
              <Media
                resource={featuredImage}
                size="33vw"
                imgClassName="h-full w-full object-cover aspect-square hover:scale-105 transition-all duration-300 "
                className="overflow-hidden rounded-lg"
              />
            </Link>
          )}
          {actions && (
            <div className="mt-auto flex items-center justify-end gap-2 absolute bottom-2 right-2">
              {actions}
            </div>
          )}
        </div>
        <div className="col-span-7">
          <div className="flex justify-between">
            {titleToUse && (
              <div className="flex items-center justify-between">
                <h3>
                  <Link href={href}>{titleToUse}</Link>
                </h3>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm bg-black text-white px-4 py-1 rounded-full"
              >
                Edit
              </button>
              <button
                onClick={() => setIsDeleteConfirmationOpen(true)}
                className="text-sm border border-black px-4 py-1 rounded-full"
              >
                {isDeleting ? <Spinner className="w-4 h-4" /> : 'Delete'}
              </button>
            </div>
          </div>

          <div className="mt-8">
            <div className="relative space-y-2">
              {isEditing ? (
                <>
                  <RatingInput value={editedRating} onChange={setEditedRating} size="sm" />
                  <textarea
                    ref={textareaRef}
                    value={editedComment}
                    onChange={(e) => setEditedComment(e.target.value)}
                    className="w-full p-2 border rounded-md outline-none"
                    rows={3}
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={handleSubmit}
                      className="text-sm bg-black text-white px-4 py-1 rounded-full"
                    >
                      {isSubmitting && isSavingRef.current ? (
                        <Spinner className="w-4 h-4" />
                      ) : (
                        'Save'
                      )}
                    </button>
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
                  </div>
                </>
              ) : (
                <>
                  {rating && (
                    <div className="flex items-center gap-1">
                      <RatingInput
                        value={rating}
                        onChange={(value) => {
                          setEditedRating(value)
                          setIsEditing(true)
                        }}
                        size="sm"
                      />
                    </div>
                  )}
                  <p>{comment.comment}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </p>
                    {comment.status === 'pending' ? (
                      <p className="text-sm text-gray-500">[ Comment under review ]</p>
                    ) : comment.status === 'rejected' ? (
                      <p className="text-sm text-gray-500">
                        [ Comment rejected. Please reach out to{' '}
                        <a className="underline" href="mailto:support@zeststudios.com">
                          support@zeststudios.com
                        </a>{' '}
                        if you have any questions. ]
                      </p>
                    ) : null}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </article>
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
                Delete
              </button>
              <button onClick={() => setIsDeleteConfirmationOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
