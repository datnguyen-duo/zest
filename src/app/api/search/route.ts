import type {
  Restaurant,
  Recipe,
  TravelGuide,
  Technique,
  Ingredient,
  Itinerary,
  RestaurantGuide,
  PriceLevel,
  Cuisine,
  Mood,
  Destination,
  MealType,
  Occasion,
  Diet,
  DifficultyLevel,
  Region,
  Environment,
  TravelStyle,
} from '@/payload-types'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const SEARCHABLE_COLLECTIONS = [
  'restaurants',
  'restaurant-guides',
  'recipes',
  'techniques',
  'ingredients',
  'travel-guides',
  'itineraries',
] as const

// Define a union type for all possible document types
type Document =
  | Restaurant
  | Recipe
  | TravelGuide
  | Technique
  | Ingredient
  | Itinerary
  | RestaurantGuide

function addUniqueFilter(
  filters: Record<string, Set<{ id: number; title: string; slug: string }>>,
  key: string,
  option: { id: number; title: string; slug: string },
) {
  if (!filters[key]) {
    filters[key] = new Set()
  }

  // Check if an option with this slug already exists
  const existing = Array.from(filters[key]).find((item) => item.slug === option.slug)
  if (!existing) {
    filters[key].add(option)
  }
}

// Type guards for each collection
function isRestaurant(doc: Document): doc is Restaurant {
  return doc.collectionType === 'restaurants' || doc.collectionType === 'restaurant-guides'
}

function isFlavor(doc: Document): doc is Recipe {
  return (
    doc.collectionType === 'recipes' ||
    doc.collectionType === 'techniques' ||
    doc.collectionType === 'ingredients'
  )
}

function isTravel(doc: Document): doc is TravelGuide {
  return doc.collectionType === 'travel-guides' || doc.collectionType === 'itineraries'
}

function isRelationship<T extends { slug?: string | null }>(
  relation: number | T | null | undefined,
): relation is T {
  return (
    relation !== null &&
    relation !== undefined &&
    typeof relation !== 'number' &&
    'slug' in relation
  )
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const searchTerm = searchParams.get('term')

    if (!searchTerm) {
      return NextResponse.json({ docs: [] })
    }

    const payload = await getPayload({ config: configPromise })
    const availableFilters: Record<string, Set<{ id: number; title: string; slug: string }>> = {}

    const results = await Promise.all(
      SEARCHABLE_COLLECTIONS.map(async (collection) => {
        const result = await payload.find({
          collection,
          where: {
            or: [{ title: { like: searchTerm } }, { slug: { like: searchTerm } }],
          },
          depth: 1,
          limit: 5,
        })

        return result.docs.map((doc: Document) => {
          let filters: Record<string, string | string[] | null> = {}

          if (isRestaurant(doc)) {
            const priceLevel = isRelationship<PriceLevel>(doc.priceLevel) ? doc.priceLevel : null
            const cuisine = doc.cuisine?.filter(isRelationship<Cuisine>) || []
            const moods = doc.moods?.filter(isRelationship<Mood>) || []
            const destination = isRelationship<Destination>(doc.destination)
              ? doc.destination
              : null

            if (priceLevel) {
              addUniqueFilter(availableFilters, 'priceLevel', {
                id: priceLevel.id,
                title: priceLevel.title,
                slug: priceLevel.slug || '',
              })
            }

            if (cuisine.length) {
              cuisine.forEach((c) => {
                if (c.slug) {
                  addUniqueFilter(availableFilters, 'cuisine', {
                    id: c.id,
                    title: c.title,
                    slug: c.slug,
                  })
                }
              })
            }

            filters = {
              priceLevel: priceLevel?.slug ?? null,
              cuisine: cuisine.map((c) => c.slug).filter((slug): slug is string => slug !== null),
              moods: moods.map((m) => m.slug).filter((slug): slug is string => slug !== null),
              destination: destination?.slug ?? null,
            }
          }

          if (isFlavor(doc)) {
            const mealType = doc.mealType?.filter(isRelationship<MealType>) || []
            const occasion = doc.occasion?.filter(isRelationship<Occasion>) || []
            const diet = doc.diet?.filter(isRelationship<Diet>) || []
            const difficultyLevel = isRelationship<DifficultyLevel>(doc.difficultyLevel)
              ? doc.difficultyLevel
              : null

            filters = {
              mealType: mealType.map((m) => m.slug).filter((slug): slug is string => slug !== null),
              occasion: occasion.map((o) => o.slug).filter((slug): slug is string => slug !== null),
              diet: diet.map((d) => d.slug).filter((slug): slug is string => slug !== null),
              difficultyLevel: difficultyLevel?.slug ?? null,
            }

            if (mealType.length) {
              mealType.forEach((m) => {
                addUniqueFilter(availableFilters, 'mealType', {
                  id: m.id,
                  title: m.title,
                  slug: m.slug || '',
                })
              })
            }

            if (occasion.length) {
              occasion.forEach((o) => {
                addUniqueFilter(availableFilters, 'occasion', {
                  id: o.id,
                  title: o.title,
                  slug: o.slug || '',
                })
              })
            }

            if (diet.length) {
              diet.forEach((d) => {
                addUniqueFilter(availableFilters, 'diet', {
                  id: d.id,
                  title: d.title,
                  slug: d.slug || '',
                })
              })
            }

            if (difficultyLevel) {
              addUniqueFilter(availableFilters, 'difficultyLevel', {
                id: difficultyLevel.id,
                title: difficultyLevel.title,
                slug: difficultyLevel.slug || '',
              })
            }
          }

          if (isTravel(doc)) {
            const travelStyle = doc.travelStyle?.filter(isRelationship<TravelStyle>) || []
            const region = isRelationship<Region>(doc.region) ? doc.region : null
            const environment = isRelationship<Environment>(doc.environment)
              ? doc.environment
              : null

            filters = {
              travelStyle: travelStyle
                .map((t) => t.slug)
                .filter((slug): slug is string => slug !== null),
              region: region?.slug ?? null,
              environment: environment?.slug ?? null,
            }
          }

          return {
            id: doc.id,
            title: doc.title,
            slug: doc.slug || null,
            collectionType: collection,
            featuredImage: doc.featuredImage,
            filters,
          }
        })
      }),
    )

    // Convert Set objects to arrays while preserving the object structure
    const processedFilters = Object.fromEntries(
      Object.entries(availableFilters).map(([key, values]) => [
        key,
        Array.from(values).map((value) => ({
          id: value.id,
          title: value.title,
          slug: value.slug,
        })),
      ]),
    )

    return NextResponse.json({
      docs: results.flat(),
      availableFilters: processedFilters,
    })
  } catch (error) {
    console.error('Error in search API:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// Taxonomy fetch function
export async function POST(request: Request) {
  try {
    const { collection } = await request.json()

    const payload = await getPayload({ config: configPromise })

    const results = await payload.find({
      collection,
      sort: 'title',
      limit: 100,
    })

    return NextResponse.json({
      docs: results.docs,
      totalDocs: results.totalDocs,
    })
  } catch (error) {
    console.error('Error fetching taxonomy:', error)
    return NextResponse.json({ error: 'Failed to fetch taxonomy' }, { status: 500 })
  }
}
