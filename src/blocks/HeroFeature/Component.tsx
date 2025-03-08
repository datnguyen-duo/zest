import type { HeroFeatureBlock as HeroFeatureProps } from '@/payload-types'
import { cn } from '@/utilities/cn'
import { getPayload } from 'payload'
import { Fragment } from 'react'
import configPromise from '@payload-config'
import { ContentDocument } from '@/collections/types'
import { Media } from '@/components/Media'
import type { Media as MediaType } from '@/payload-types'
import Link from 'next/link'
import { getRelationshipLink } from '@/utilities/links'
import { Carousel } from '@/components/Carousel'
import { CarouselSlide } from '@/components/Carousel/CarouselSlide'
import { Card, CardData } from '@/components/Card'

export const HeroFeatureBlock: React.FC<HeroFeatureProps> = (props) => {
  const { title, titlePosition, primaryContent, secondaryContent } = props

  let primaryPosts: CardData[] = []
  let secondaryPosts: CardData[] = []

  if (primaryContent?.variation === 'static' && primaryContent?.post) {
    const selectedPost = {
      ...primaryContent.post,
      collectionType: primaryContent.post.relationTo,
    }
    primaryPosts = [selectedPost as CardData]
  } else if (primaryContent?.variation === 'slider' && primaryContent?.posts?.length) {
    const selectedPosts = primaryContent.posts.map((post) => {
      if (typeof post.value === 'object') {
        return {
          ...post.value,
          collectionType: post.relationTo,
          featuredImage: post.value.featuredImage || post.value.meta?.image,
        }
      }
    }) as Array<CardData>

    primaryPosts = selectedPosts
  }

  if (secondaryContent?.posts?.length) {
    const selectedPosts = secondaryContent.posts.map((post) => {
      if (typeof post.value === 'object') {
        return {
          ...post.value,
          collectionType: post.relationTo,
          featuredImage: post.value.featuredImage || post.value.meta?.image,
        }
      }
    }) as Array<CardData>

    secondaryPosts = selectedPosts
  }

  return (
    <section
      className={cn('grid grid-cols-12 gap-4', {
        'p-4': secondaryContent.hasHeader,
      })}
    >
      <div className="col-span-7">
        {titlePosition === 'left' && <h1 className="text-h1">{title}</h1>}
        {primaryContent?.variation === 'static' && primaryContent?.post && (
          <Media
            resource={primaryContent.post.featuredImage as MediaType}
            imgClassName="aspect-square w-full h-full object-cover"
          />
        )}
        {primaryContent?.variation === 'slider' && primaryContent?.posts && (
          <Carousel
            className={cn(
              'overflow-hidden rounded-br-3xl',
              secondaryContent.hasHeader && 'rounded-3xl',
            )}
            showDots
            showArrows={false}
            fade
            autoplay
            autoplayDelay={7000}
            dotLabels={primaryPosts.map((post) => {
              return post.collectionType
                ? post.collectionType.charAt(0).toUpperCase() + post.collectionType.slice(1)
                : ''
            })}
            dotClassName="py-2 px-4 rounded-full transition-all"
            dotsClassName="left-4 right-auto"
          >
            {primaryPosts.map((post) => (
              <CarouselSlide key={`${post.collectionType}-${post.id}`}>
                <h3 className="text-h3 absolute left-4 bottom-20">{post.title}</h3>
                <Media
                  resource={post.featuredImage as MediaType}
                  imgClassName="aspect-square w-full h-full object-cover"
                />
              </CarouselSlide>
            ))}
          </Carousel>
        )}
      </div>

      <div
        className={cn('col-span-5', {
          'p-12 rounded-3xl bg-gray-100': secondaryContent.hasHeader,
        })}
      >
        {titlePosition === 'right' && <h1 className="text-h1">{title}</h1>}
        {secondaryContent.hasHeader && (
          <div className="flex justify-between items-center mb-4">
            {secondaryContent.title && <h2 className="text-h4">{secondaryContent.title}</h2>}
            {secondaryContent.link && (
              <Link href={getRelationshipLink(secondaryContent.link)} className="button">
                View All
              </Link>
            )}
          </div>
        )}
        {secondaryPosts.length > 0 && (
          <div className="flex flex-col gap-4">
            {secondaryPosts.map((post) => (
              <Card
                key={post.id}
                variation={titlePosition === 'right' ? 'overlay' : 'default'}
                doc={post}
                collectionType={post.collectionType}
                showCollectionType={true}
                isLoading={false}
                aspectRatio="16/9"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
