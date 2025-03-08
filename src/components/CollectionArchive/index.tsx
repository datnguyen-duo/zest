import { cn } from '@/utilities/cn'
import React from 'react'

import { Card, CardData } from '@/components/Card'
import { LikeButton } from '@/components/LikeButton'
import { SaveButton } from '@/components/SaveButton'

export type Props = {
  posts: CardData[]
  showCollectionType?: boolean
}

export const CollectionArchive: React.FC<Props> = (props) => {
  const { posts, showCollectionType = true } = props

  return (
    <div className={cn('container')}>
      <div>
        <div className="grid grid-cols-4 gap-y-8 gap-x-4">
          {posts?.map((result, index) => {
            const { id, collectionType } = result

            if (typeof result === 'object' && result !== null) {
              return (
                <div key={index}>
                  <Card
                    className="h-full"
                    doc={result}
                    collectionType={collectionType || 'posts'}
                    showCollectionType={showCollectionType}
                    showDescription={false}
                    showTaxonomies={false}
                    actions={
                      <>
                        <LikeButton collectionType={collectionType || 'posts'} postId={id} />
                        <SaveButton collectionType={collectionType || 'posts'} postId={id} />
                      </>
                    }
                  />
                </div>
              )
            }
            return null
          })}
        </div>
      </div>
    </div>
  )
}
