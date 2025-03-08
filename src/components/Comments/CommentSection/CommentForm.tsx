import { useState } from 'react'
import { CommentFormProps } from '../types'
import RatingInput from './RatingInput'
import { cn } from '@/utilities/cn'
import Spinner from '@/components/ui/spinner'

export default function CommentForm({
  postId,
  collectionType,
  parentId,
  onCancel,
  onLogin,
  initialRating,
  placeholder,
  onSuccess,
  isSubmitting,
}: CommentFormProps) {
  const [comment, setComment] = useState('')
  const [rating, setRating] = useState(initialRating)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!rating && !comment.trim()) {
      return
    }
    await onSuccess({
      comment,
      rating,
      parentId,
      postId,
      collectionType,
    })

    // Clear form after successful submission
    setComment('')
    setRating(undefined)
  }

  const isDisabled = isSubmitting || (!rating && !comment.trim())

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 p-4"
    >
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={placeholder}
        className="w-full p-2 outline-none border-none"
        rows={3}
      />

      <div
        className={cn(
          'flex gap-2 items-center justify-between',
          !parentId && 'pt-4 border-t border-gray-200',
        )}
      >
        {!parentId && ( // Only show rating for top-level comments
          <div className="flex gap-2 items-center">
            <p className="text-sm text-gray-500">Leave a rating</p>
            <RatingInput value={rating} onChange={setRating} />
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isDisabled}
            className="px-4 py-2 bg-black text-white rounded-lg disabled:opacity-50 flex items-center justify-center"
          >
            {isSubmitting ? <Spinner className="w-4 h-4" /> : 'Submit'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </form>
  )
}
