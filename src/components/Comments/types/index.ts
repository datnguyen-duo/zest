import type { Comment as CommentType } from '@/payload-types'

export interface PaginatedDocs<T> {
  docs: T[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
  pagingCounter: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage: number | null
  nextPage: number | null
}

export type PaginatedComments = PaginatedDocs<CommentType>

export interface CommentFormData {
  comment: string
  rating?: number
  parentId?: number
  post: {
    id: number
    relationTo: string
  }
}

export interface CommentSectionProps {
  collectionType: string
  postId: number
  postTitle: string
  initialComments?: PaginatedComments
  allowReplies?: boolean
  maxDepth?: number
}

export interface CreateCommentData {
  comment: string
  rating?: number
  parentId?: number
  postId: number
  collectionType: string
}

export interface CommentItemProps {
  comment: CommentType
  onReply?: (parentId: number) => void
  depth?: number
  maxDepth?: number
}

export interface CommentFormProps {
  postId: number
  collectionType: string
  parentId?: number
  onSuccess: (data: CreateCommentData) => Promise<void> // Updated type
  onCancel?: () => void
  onLogin?: () => void
  initialRating?: number
  placeholder?: string
  isSubmitting?: boolean
}
