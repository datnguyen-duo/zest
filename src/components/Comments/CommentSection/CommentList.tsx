import type { Comment as CommentType } from '@/payload-types'
import CommentItem from './CommentItem'
import { PaginatedComments } from '../types'
import RatingInput from './RatingInput'

interface CommentListProps {
  comments: PaginatedComments
  onReply?: (commentId: number) => void
  maxDepth?: number
  getReplies: (parentId: number) => CommentType[]
}

export default function CommentList({ comments, onReply, maxDepth = 3 }: CommentListProps) {
  // Filter for top-level comments (no parentId)

  const topLevelComments = comments?.docs.filter((comment) => !comment.parentId)

  const getReplies = (parentId: number) => {
    return comments?.docs.filter((comment) => comment.parentId?.toString() === parentId.toString())
  }

  if (!comments?.docs?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No comments yet. Be the first to comment!</p>
      </div>
    )
  }

  return (
    <>
      <div className="flex mt-8 justify-between border-b border-gray-200 pb-4">
        <p className="text-gray-500 text-lg">
          Comments:{' '}
          <span className="text-sm p-1 rounded-full bg-gray-100 h-6 w-6 inline-flex items-center justify-center">
            {comments?.totalDocs + comments?.docs.filter((comment) => comment.adminReply).length}
          </span>
        </p>

        <div className="flex items-center gap-2">
          <p className="text-gray-500 text-lg">
            Average Rating:{' '}
            <span className="text-gray-500 text-sm">
              {comments?.docs
                .filter((comment) => comment.rating)
                .reduce((acc, comment) => acc + comment.rating!, 0) /
                comments?.docs.filter((comment) => comment.rating).length || 0}
              /5
            </span>
          </p>
          <RatingInput
            value={
              comments?.docs
                .filter((comment) => comment.rating)
                .reduce((acc, comment) => acc + comment.rating!, 0) /
                comments?.docs.filter((comment) => comment.rating).length || 0
            }
            onChange={() => {}}
            disabled
            size="sm"
          />
        </div>
      </div>

      <div className="space-y-2">
        {topLevelComments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            replies={getReplies(comment.id)}
            onReply={onReply}
            depth={0}
            maxDepth={maxDepth}
          />
        ))}
      </div>
    </>
  )
}
