'use client'

import { useEffect, useState } from 'react'
import { CommentSectionProps } from '../types'
import CommentForm from './CommentForm'
import CommentList from './CommentList'
import type { CreateCommentData, PaginatedComments } from '../types'
import { useComments } from '../hooks/useComments'
import { useCreateComment } from '../hooks/useCreateComment'
import { useCommentReplies } from '../hooks/useCommentReplies'
import { usePopup } from '@/contexts/PopupContext'
import Spinner from '@/components/ui/spinner'
import { toast } from 'react-hot-toast'
import { auth } from '@/firebase.config'

export default function CommentSection({
  postId,
  collectionType,
  initialComments,
  postTitle,
  allowReplies = true,
  maxDepth = 3,
}: CommentSectionProps) {
  const [user, setUser] = useState(auth.currentUser)
  const { comments, setComments, isLoading, error } = useComments({
    postId,
    collectionType,
    initialComments,
    postTitle,
  })
  const { createComment, isSubmitting } = useCreateComment()
  const { getReplies } = useCommentReplies(comments)
  const [replyToId, setReplyToId] = useState<number | null>(null)
  const { setIsLoginPopupOpen, setLoginMessage } = usePopup()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user)
    })
    return () => unsubscribe()
  }, [])

  const isFormSubmitting = (formId: number | null) => {
    return isSubmitting && ((formId && formId === replyToId) || (!formId && !replyToId))
  }

  const handleCommentSubmit = async (data: CreateCommentData) => {
    const newComment = await createComment(data)

    if (comments) {
      if (newComment?.isUpdate) {
        const isRatingOnlyUpdate = !data.comment.trim() && typeof data.rating === 'number'
        if (isRatingOnlyUpdate) {
          setComments({
            ...comments,
            docs: comments.docs.map((comment) =>
              comment.id === newComment.id ? newComment : comment,
            ),
          })
          toast.success('Rating updated!')
        } else {
          toast.success('Comment updated!')
        }
      } else {
        if (newComment?.comment?.trim()) {
          toast.success('Comment submitted!')
        } else {
          toast.success('Thank you for your rating!')
        }
        setReplyToId(null)
      }
    }
  }

  const handleLogin = () => {
    setLoginMessage('Login to comment')
    setIsLoginPopupOpen(true)
  }

  if (isLoading)
    return (
      <div className="space-y-8 max-w-[48rem] mx-auto mt-12 flex justify-center items-center">
        <Spinner />
      </div>
    )

  return (
    <div className="max-w-[48rem] mx-auto mt-12">
      <h2 className="text-2xl font-bold mb-2">Join the conversation</h2>

      {/* List of comments */}
      {!user ? (
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-500 mb-2">Please log in to leave a comment.</p>
          <button
            onClick={handleLogin}
            className="text-sm text-gray-500 py-2 px-4 rounded-full bg-white border border-gray-300 hover:bg-gray-100"
          >
            Login
          </button>
        </div>
      ) : (
        <>
          {/* Main comment form */}
          <CommentForm
            postId={postId}
            collectionType={collectionType}
            onSuccess={handleCommentSubmit}
            onLogin={handleLogin}
            placeholder={`What did you think about ${postTitle}?`}
            isSubmitting={isFormSubmitting(null)}
          />
        </>
      )}

      <CommentList
        comments={comments as PaginatedComments}
        onReply={allowReplies ? setReplyToId : undefined}
        maxDepth={maxDepth}
        getReplies={getReplies}
      />

      {/* Reply form */}
      {replyToId && (
        <CommentForm
          postId={postId}
          collectionType={collectionType}
          parentId={replyToId}
          onSuccess={handleCommentSubmit}
          onCancel={() => setReplyToId(null)}
          placeholder="Reply"
          isSubmitting={isFormSubmitting(replyToId)}
        />
      )}
    </div>
  )
}
