import { useMemo } from 'react'
import type { Comment as CommentType } from '@/payload-types'
import type { PaginatedComments } from '../types'

export const useCommentReplies = (paginatedComments: PaginatedComments | undefined) => {
  const commentMap = useMemo(() => {
    const map = new Map<string, Array<CommentType>>()

    if (!paginatedComments?.docs || !Array.isArray(paginatedComments.docs)) {
      return map
    }

    paginatedComments.docs.forEach((comment) => {
      if (comment.parentId) {
        const parentIdString = String(comment.parentId)
        const replies = map.get(parentIdString) || []
        map.set(parentIdString, [...replies, comment])
      }
    })

    return map
  }, [paginatedComments])

  const getReplies = (parentId: number | string) => {
    const parentIdString = String(parentId)
    return commentMap.get(parentIdString) || []
  }

  return { getReplies }
}
