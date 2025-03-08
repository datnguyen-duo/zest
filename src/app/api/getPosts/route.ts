import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { postIds, collectionType, page = 1, limit = 8 } = await request.json()

    const payload = await getPayload({ config: configPromise })

    const results = await payload.find({
      collection: collectionType,
      where: {
        id: {
          in: postIds,
        },
      },
      depth: 1,
      page,
      limit,
    })
    const docsWithOrder = results.docs.map((doc) => ({
      ...doc,
      collectionType: collectionType,
      // Find the original index in postIds array
      originalIndex: postIds.indexOf(doc.id),
    }))

    return NextResponse.json({
      docs: docsWithOrder,
      totalDocs: results.totalDocs,
      hasNextPage: results.hasNextPage,
      nextPage: results.nextPage,
      page: results.page,
    })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}
