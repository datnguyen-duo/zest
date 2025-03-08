import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { auth } from '@/firebase.config'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')
    const collectionType = searchParams.get('collectionType')
    const firebaseUID = searchParams.get('where[firebaseUID][equals]')
    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 8
    const payload = await getPayload({ config: configPromise })

    // Case 1: Fetch user's comments (for dashboard)
    if (firebaseUID) {
      const userComments = await payload.find({
        collection: 'comments',
        where: {
          firebaseUID: { equals: firebaseUID },
          rating: { exists: true },
        },
        sort: '-createdAt',
        depth: 2, // To populate post relationships
        page,
        limit,
      })
      return NextResponse.json({
        docs: userComments.docs,
        totalDocs: userComments.totalDocs,
        hasNextPage: userComments.hasNextPage,
        nextPage: userComments.hasNextPage ? page + 1 : null,
        page,
        totalPages: userComments.totalPages,
      })
    }

    // Case 2: Fetch post comments (for post pages)
    if (!postId || !collectionType) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    const comments = await payload.find({
      collection: 'comments',
      where: {
        'post.value': { equals: Number(postId) },
        'post.relationTo': { equals: collectionType },
        status: { equals: 'approved' },
      },
      sort: '-createdAt',
      page,
      limit,
    })

    return NextResponse.json({
      docs: comments.docs,
      totalDocs: comments.totalDocs,
      hasNextPage: comments.hasNextPage,
      nextPage: comments.hasNextPage ? page + 1 : null,
      page,
      totalPages: comments.totalPages,
    })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json({ error: 'Error fetching comments' }, { status: 500 })
  }
}

// POST /api/comments
export async function POST(request: Request) {
  try {
    const payload = await getPayload({ config: configPromise })
    const body = await request.json()
    const { id, comment, rating, parentId, postId, collectionType, firebaseUID, name } = body

    const hasComment = Boolean(comment?.trim())

    const determineStatus = (
      currentComment: string | null | undefined,
      existingStatus: 'approved' | 'pending' | 'rejected' | null | undefined,
    ) => {
      if (hasComment) return 'pending' // If there's a comment, always pending
      if (existingStatus === 'pending') return 'pending' // Maintain pending status
      return 'approved' // Only approved if no comment and wasn't pending
    }

    // Case 1: Editing an existing comment (by ID)
    if (id) {
      const existingComment = await payload.findByID({
        collection: 'comments',
        id: id,
      })

      if (!existingComment || existingComment.firebaseUID !== firebaseUID) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }

      const updatedComment = await payload.update({
        collection: 'comments',
        id: id,
        data: {
          comment: comment?.trim() || existingComment.comment,
          rating: rating || existingComment.rating,
          status: determineStatus(comment, existingComment.status),
        },
      })

      return NextResponse.json(updatedComment)
    }

    // Case 2: Check for existing comment on same post
    const existingComment = await payload.find({
      collection: 'comments',
      where: {
        firebaseUID: { equals: firebaseUID },
        'post.value': { equals: Number(postId) },
        'post.relationTo': { equals: collectionType },
        parentId: { equals: null }, // Match parentId to maintain reply structure
      },
      limit: 1,
    })

    if (existingComment.docs.length > 0) {
      const updatedComment = await payload.update({
        collection: 'comments',
        id: existingComment.docs[0].id,
        data: {
          comment: comment?.trim() || existingComment.docs[0].comment,
          rating: rating || existingComment.docs[0].rating,
          status: determineStatus(comment, existingComment.docs[0].status),
        },
      })

      return NextResponse.json(updatedComment)
    }

    // Case 3: Create new comment
    const newComment = await payload.create({
      collection: 'comments',
      data: {
        comment: comment?.trim() || '',
        rating,
        parentId,
        post: {
          relationTo: collectionType,
          value: Number(postId),
        },
        status: determineStatus(comment, null),
        firebaseUID,
        name,
      },
    })

    return NextResponse.json(newComment)
  } catch (error) {
    console.error('Error with comment:', error)
    return NextResponse.json({ error: 'Error processing comment' }, { status: 500 })
  }
}

// DELETE /api/comments
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url)
    const params = new URLSearchParams(url.search)

    // Get all ID parameters
    const ids: string[] = []
    params.forEach((value, key) => {
      if (key.includes('[id][in]')) {
        ids.push(value)
      }
    })

    if (!ids.length) {
      return NextResponse.json({ error: 'No IDs provided for deletion' }, { status: 400 })
    }

    const payload = await getPayload({ config: configPromise })

    // Delete all comments in parallel
    const results = await Promise.all(
      ids.map(async (id: string) => {
        try {
          await payload.delete({
            collection: 'comments',
            id: id,
          })
          return { id, success: true }
        } catch (error) {
          console.error(`Failed to delete comment ${id}:`, error)
          return { id, success: false, error }
        }
      }),
    )

    // Return in Payload's expected format
    return NextResponse.json({
      docs: results.map((result) => ({ id: result.id })),
      errors: results
        .filter((result) => !result.success)
        .map((result) => ({
          message: `Failed to delete comment ${result.id}`,
          id: result.id,
        })),
      totalDocs: results.length,
      deletedDocs: results.filter((result) => result.success).length,
    })
  } catch (error) {
    console.error('Error in bulk delete:', error)
    return NextResponse.json({ error: 'Failed to delete comments' }, { status: 500 })
  }
}
