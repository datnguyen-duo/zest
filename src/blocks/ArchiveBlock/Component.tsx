import type { ArchiveBlock as ArchiveBlockProps } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import RichText from '@/components/RichText'

import { CollectionArchive } from '@/components/CollectionArchive'
import { CardData } from '@/components/Card'
import { ContentCollection, ContentDocument } from '@/collections/types'
export const ArchiveBlock: React.FC<
  ArchiveBlockProps & {
    id?: string
  }
> = async (props) => {
  const {
    id,
    categories,
    introContent,
    limit: limitFromProps,
    populateBy,
    selectedDocs,
    relationTo,
  } = props

  const limit = limitFromProps || 3

  let posts: Array<ContentDocument> = []

  if (populateBy === 'collection') {
    const payload = await getPayload({ config: configPromise })

    const flattenedCategories = categories?.map((category) => {
      if (typeof category === 'object') return category.id
      else return category
    })
    const fetchedDocs = await payload.find({
      collection: relationTo as ContentCollection,
      depth: 1,
      limit,
      ...(flattenedCategories && flattenedCategories.length > 0
        ? {
            where: {
              categories: {
                in: flattenedCategories,
              },
            },
          }
        : {}),
    })

    posts = fetchedDocs.docs.map((doc) => ({
      ...doc,
      collectionType: doc.collectionType || 'posts',
      featuredImage: doc.featuredImage || doc.meta?.image,
    }))
  } else {
    if (selectedDocs?.length) {
      const filteredSelectedPosts = selectedDocs.map((post) => {
        if (typeof post.value === 'object')
          return {
            ...post.value,
            collectionType: post.relationTo,
            featuredImage: post.value.featuredImage || post.value.meta?.image,
          }
      }) as Array<ContentDocument>

      posts = filteredSelectedPosts
    }
  }

  return (
    <div className="my-16" id={`block-${id}`}>
      {introContent && (
        <div className="container mb-16">
          <RichText className="ml-0 max-w-[48rem]" data={introContent} enableGutter={false} />
        </div>
      )}
      <CollectionArchive posts={posts as CardData[]} />
    </div>
  )
}
