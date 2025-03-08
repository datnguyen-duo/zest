'use client'
import { cn } from '@/utilities/cn'
import Link from 'next/link'
import React from 'react'
import { Media } from '@/components/Media'
import type { Media as MediaType } from '@/payload-types'
import { CardSkeleton } from '@/components/Card/CardSkeleton'
import { TaxonomyType } from '@/collections/taxonomies/types'
import { CardTaxonomies } from './CardTaxonomies'
import { Tag } from '../ui/tag'
import Favicon from '../Logo/Favicon'
export interface TaxonomyRelation<T extends TaxonomyType> {
  relationTo: T
  id: number
  slug: string
  title: string
}

// export type CardPostData = {
//   id: number
//   slug?: string
//   title?: string
//   collectionType?: string
//   meta?: {
//     title?: string
//     description?: string
//   }
//   featuredImage?: (number | null) | MediaType
// }

// Base card data interface
export interface BaseCardData {
  id: number
  collectionType: string
  title: string
  slug: string
  featuredImage?: (number | null) | MediaType
  meta?: {
    title?: string
    description?: string
  }
}

// Restaurant-specific card data
export interface RestaurantCardData extends BaseCardData {
  collectionType: 'restaurants' | 'restaurant-guides'
  priceLevel?: TaxonomyRelation<'price-levels'>
  cuisines?: TaxonomyRelation<'cuisines'>[]
  moods?: TaxonomyRelation<'moods'>[]
  destination?: TaxonomyRelation<'destinations'>
}

// Recipe-specific card data
export interface RecipeCardData extends BaseCardData {
  collectionType: 'recipes' | 'techniques' | 'ingredients'
  mealType?: TaxonomyRelation<'meal-types'>
  occasion?: TaxonomyRelation<'occasions'>
  diet?: TaxonomyRelation<'diets'>[]
  difficultyLevel?: TaxonomyRelation<'difficulty-levels'>
}

// Travel-specific card data
export interface TravelCardData extends BaseCardData {
  collectionType: 'travel-guides' | 'itineraries'
  travelStyle?: TaxonomyRelation<'travel-styles'>
  region?: TaxonomyRelation<'regions'>
  environment?: TaxonomyRelation<'environments'>[]
}

// Union type for all card data
export type CardData = RestaurantCardData | RecipeCardData | TravelCardData

export const Card: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardData
  aspectRatio?: string
  rating?: number | null | undefined
  collectionType: string
  showCollectionType: boolean
  showTaxonomies?: boolean
  taxonomyLimit?: number
  title?: string
  actions?: React.ReactNode
  showDescription?: boolean
  isLoading?: boolean
  variation?: 'overlay' | 'default'
}> = (props) => {
  const {
    className,
    doc,
    collectionType,
    title: titleFromProps,
    actions,
    showDescription,
    isLoading,
    showCollectionType,
    showTaxonomies,
    taxonomyLimit,
    aspectRatio = '1:1',
    variation = 'default',
  } = props

  const { slug, meta, title, featuredImage } = doc || {}
  const { description } = meta || {}

  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ') // replace non-breaking space with white space
  const href = `/${collectionType}/${slug}`
  if (isLoading) return <CardSkeleton />
  return (
    <article className={cn('overflow-hidden relative', className)}>
      <div className="relative overflow-hidden rounded-lg mb-2">
        {!featuredImage && (
          <Link href={href} className="flex items-center justify-center p-10">
            <Favicon color="#000000" className={cn('aspect-square', aspectRatio)} />
          </Link>
        )}
        {featuredImage && typeof featuredImage !== 'string' && (
          <Link href={href}>
            <Media
              resource={featuredImage}
              imgClassName={cn(
                'h-full w-full object-cover hover:scale-105 transition-all duration-300',
                `aspect-[calc(${aspectRatio})]`,
              )}
            />
          </Link>
        )}
        {actions && (
          <div className="mt-auto flex items-center justify-end gap-2 absolute bottom-2 right-2">
            {actions}
          </div>
        )}
      </div>
      <div
        className={cn({
          'absolute bottom-0 left-0 p-4': variation === 'overlay',
        })}
      >
        {showCollectionType && (
          <div className="flex items-center gap-2 my-2">
            <Tag collectionType={collectionType}>
              {collectionType.charAt(0).toUpperCase() + collectionType.slice(1)}
            </Tag>
          </div>
        )}
        {showTaxonomies && <CardTaxonomies data={doc as CardData} taxonomyLimit={taxonomyLimit} />}
        {titleToUse && (
          <div className="flex items-center justify-between">
            <h3>
              <Link href={href}>{titleToUse}</Link>
            </h3>
          </div>
        )}
        {showDescription && description && (
          <div className="mt-2">{description && <p>{sanitizedDescription}</p>}</div>
        )}
      </div>
    </article>
  )
}
