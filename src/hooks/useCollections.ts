import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  useInfiniteQuery,
} from '@tanstack/react-query'
import { auth, db } from '@/firebase.config'
import {
  collection,
  doc,
  getDocs,
  getDoc,
  writeBatch,
  updateDoc,
  query,
  orderBy,
  limit as limitDocs,
  startAfter,
  QueryDocumentSnapshot,
  getCountFromServer,
} from 'firebase/firestore'
import { nanoid } from 'nanoid'
import { toast } from 'react-hot-toast'
import { CardData } from '@/components/Card'

export interface StoredPost {
  id: number
  collectionType: string
}

// Extended post with CardData
export type StoredPostWithData = StoredPost & CardData

// Collection interface with simplified posts structure
export interface Collection {
  id: string
  ownerId: string
  ownerName: string | 'Anonymous'
  name: string
  description?: string
  createdAt: string
  updatedAt: string
  posts: StoredPost[] // Simple array of minimal post data
}

// Paginated response type (used when fetching posts from API)
export interface PaginatedResponse<T> {
  docs: T[]
  totalDocs: number
  hasNextPage: boolean
  nextPage: number | null
}

// Type for the API response
export type PostsResponse = PaginatedResponse<StoredPostWithData>
// Mutation Input Types
export type CreateCollectionInput = {
  name: string
  description?: string
  initalPost?: {
    id: number
    collectionType: string
  }
}

export type UpdateCollectionInput = {
  id: string
  name: string
  description?: string
}

export type SaveToCollectionInput = {
  collectionId: string
  post: {
    id: number
    collectionType: string
    action: 'add' | 'remove'
  }
  skipToast?: boolean
}
export interface UseCollectionsOptions {
  limit?: number
}
// Hook Return Types
export type UseCollectionResult = UseQueryResult<Collection, Error>
export type UseCollectionPostsResult = UseQueryResult<PaginatedResponse<CardData>, Error>

export interface UseCollectionsResult {
  collections: Collection[]
  isLoading: boolean
  error: Error | null
  createCollection: (input: CreateCollectionInput) => Promise<Collection>
  updateCollection: (input: UpdateCollectionInput) => Promise<Collection>
  deleteCollection: (id: string) => Promise<void>
  saveToCollection: (input: SaveToCollectionInput) => Promise<void>
}

interface CollectionsPage {
  items: Collection[]
  lastDoc: QueryDocumentSnapshot | null
  total: number
}

interface CollectionsInfiniteData {
  pages: Array<{
    items: Collection[]
    lastDoc: QueryDocumentSnapshot | null
  }>
  pageParams: Array<QueryDocumentSnapshot | null>
}

// Helper function to fetch posts from Payload
async function fetchCollectionPosts(
  postIds: number[],
  collectionType: string,
): Promise<PostsResponse> {
  const response = await fetch('/api/getPosts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      postIds,
      collectionType,
      page: 1,
      limit: 8,
    }),
  })
  return response.json()
}

// Single collection hook
function useCollection(collectionId: string, isPublic = false): UseCollectionResult {
  return useQuery({
    queryKey: ['collection', collectionId],
    queryFn: async () => {
      if (!isPublic && !auth.currentUser) {
        throw new Error('Not authenticated')
      }

      const collectionRef = doc(db, 'collections', collectionId)
      const collectionSnap = await getDoc(collectionRef)

      if (!collectionSnap.exists()) {
        throw new Error('Collection not found')
      }

      return {
        id: collectionSnap.id,
        ...collectionSnap.data(),
      } as Collection
    },
    enabled: Boolean(collectionId),
  })
}

function useCollectionPosts(posts: StoredPost[]): UseCollectionPostsResult {
  return useQuery({
    queryKey: ['collectionPosts', posts.map((p) => `${p.collectionType}-${p.id}`).join(',')],
    queryFn: async () => {
      // Group posts by collection type
      const groupedPosts = posts.reduce(
        (acc, post) => {
          // Ensure collection type exists and format it
          if (!post.collectionType) {
            console.warn('Post missing collection type:', post)
            return acc
          }

          const key = post.collectionType
          if (!acc[key]) acc[key] = []
          acc[key].push(post.id)
          return acc
        },
        {} as Record<string, number[]>,
      )

      // Skip if no valid posts
      if (Object.keys(groupedPosts).length === 0) {
        return {
          docs: [],
          totalDocs: 0,
          hasNextPage: false,
          nextPage: null,
        }
      }

      // Fetch all post groups
      const results = await Promise.all(
        Object.entries(groupedPosts).map(([type, ids]) => fetchCollectionPosts(ids, type)),
      )

      // Combine results
      return results.reduce(
        (acc, result) => ({
          docs: [...acc.docs, ...result.docs],
          totalDocs: acc.totalDocs + result.totalDocs,
          hasNextPage: acc.hasNextPage || result.hasNextPage,
          nextPage: Math.max(acc.nextPage || 0, result.nextPage || 0),
        }),
        {
          docs: [],
          totalDocs: 0,
          hasNextPage: false,
          nextPage: null,
        } as PaginatedResponse<CardData>,
      )
    },
    enabled: posts.length > 0,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCollections(options: UseCollectionsOptions = { limit: 8 }) {
  const queryClient = useQueryClient()
  const limit = options.limit || 8

  // Main collections query
  const { data, isLoading, error, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery<CollectionsPage>({
      queryKey: ['collections', auth.currentUser?.uid],
      queryFn: async ({ pageParam = null }) => {
        if (!auth.currentUser) return { items: [], lastDoc: null, total: 0 }

        // Get user's collection references
        const userCollectionsRef = collection(db, 'users', auth.currentUser.uid, 'collections')
        const totalSnap = await getCountFromServer(userCollectionsRef)
        const total = totalSnap.data().count

        if (total === 0) return { items: [], lastDoc: null, total: 0 }

        let collectionQuery = query(
          userCollectionsRef,
          orderBy('updatedAt', 'desc'),
          limitDocs(limit),
        )

        if (pageParam) {
          collectionQuery = query(collectionQuery, startAfter(pageParam))
        }

        const userCollectionsSnap = await getDocs(collectionQuery)

        // Check if there are more documents after this batch
        const lastVisible = userCollectionsSnap.docs[userCollectionsSnap.docs.length - 1]
        const nextQuery = query(
          userCollectionsRef,
          orderBy('updatedAt', 'desc'),
          startAfter(lastVisible),
          limitDocs(1),
        )
        const nextSnap = await getDocs(nextQuery)

        const hasMore = !nextSnap.empty
        // Fetch each collection's data
        const collectionsData = await Promise.all(
          userCollectionsSnap.docs.map(async (userCollectionDoc) => {
            const { collectionId } = userCollectionDoc.data()

            const collectionRef = doc(db, 'collections', collectionId)
            const collectionSnap = await getDoc(collectionRef)

            if (!collectionSnap.exists()) {
              console.warn('Collection not found:', collectionId)
              return null
            }

            const data = {
              id: collectionSnap.id,
              ...collectionSnap.data(),
              posts: collectionSnap.data()?.posts || [],
            } as Collection

            return data
          }),
        )

        return {
          items: collectionsData.filter((c): c is Collection => c !== null),
          lastDoc: hasMore ? lastVisible : null,
          total,
        }
      },
      getNextPageParam: (lastPage) => lastPage.lastDoc,
      initialPageParam: null,
      enabled: !!auth.currentUser,
    })

  // Create collection mutation
  const createCollection = useMutation({
    mutationFn: async ({ name, description }: CreateCollectionInput) => {
      if (!auth.currentUser) throw new Error('Not authenticated')

      const collectionId = nanoid()
      const timestamp = new Date().toISOString()

      const newCollection: Collection = {
        id: collectionId,
        ownerId: auth.currentUser.uid,
        ownerName: auth.currentUser.displayName || 'Anonymous',
        name: name.trim(),
        description: description?.trim() || '',
        createdAt: timestamp,
        updatedAt: timestamp,
        posts: [],
      }

      const batch = writeBatch(db)
      batch.set(doc(db, 'collections', collectionId), newCollection)
      batch.set(doc(db, 'users', auth.currentUser.uid, 'collections', collectionId), {
        collectionId,
        createdAt: timestamp,
        updatedAt: timestamp,
      })

      await batch.commit()
      return newCollection
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections', auth.currentUser?.uid] })
      // Remove success toast from here - we'll handle it in the component
    },
    onError: (error) => {
      console.error('Error creating collection:', error)
      toast.error('Failed to create collection')
    },
  })

  const updateCollection = useMutation({
    mutationFn: async ({ id, name, description }: UpdateCollectionInput) => {
      if (!auth.currentUser) throw new Error('Not authenticated')

      const timestamp = new Date().toISOString()
      const batch = writeBatch(db)

      // Update main collection
      const collectionRef = doc(db, 'collections', id)
      const updatedData = {
        name: name.trim(),
        description: description?.trim() || '',
        updatedAt: timestamp,
      }
      batch.update(collectionRef, updatedData)

      // Update user's collection reference
      const userCollectionRef = doc(db, 'users', auth.currentUser.uid, 'collections', id)
      batch.update(userCollectionRef, {
        updatedAt: timestamp,
      })

      await batch.commit()
      return { id, ...updatedData }
    },
    onSuccess: (updatedData) => {
      // Update collections cache
      queryClient.setQueryData<CollectionsInfiniteData>(
        ['collections', auth.currentUser?.uid],
        (old) => {
          if (!old?.pages) return old
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((collection) =>
                collection.id === updatedData.id ? { ...collection, ...updatedData } : collection,
              ),
            })),
          }
        },
      )

      // Update single collection cache
      queryClient.setQueryData<Collection>(['collection', updatedData.id], (oldCollection) =>
        oldCollection ? { ...oldCollection, ...updatedData } : oldCollection,
      )
    },
    onError: (error) => {
      console.error('Error updating collection:', error)
      toast.error('Failed to update collection')
    },
  })

  // Delete collection mutation
  const deleteCollection = useMutation({
    mutationFn: async (collectionId: string) => {
      if (!auth.currentUser) throw new Error('Not authenticated')

      const batch = writeBatch(db)
      batch.delete(doc(db, 'collections', collectionId))
      batch.delete(doc(db, 'users', auth.currentUser.uid, 'collections', collectionId))

      await batch.commit()
      return collectionId
    },
    onSuccess: (deletedId) => {
      // Remove from collections cache
      queryClient.setQueryData<CollectionsInfiniteData>(
        ['collections', auth.currentUser?.uid],
        (old) => {
          if (!old?.pages) return old
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.filter((collection) => collection.id !== deletedId),
            })),
          }
        },
      )

      // Remove single collection cache
      queryClient.removeQueries({ queryKey: ['collection', deletedId] })

      toast.success('Collection deleted!')
    },
    onError: (error) => {
      console.error('Error deleting collection:', error)
      toast.error('Failed to delete collection')
    },
  })

  // Save to collection mutation
  const saveToCollection = useMutation({
    mutationFn: async ({ collectionId, post }: SaveToCollectionInput) => {
      if (!auth.currentUser) throw new Error('Not authenticated')

      const collectionRef = doc(db, 'collections', collectionId)
      const collectionSnap = await getDoc(collectionRef)

      if (!collectionSnap.exists()) {
        throw new Error('Collection not found')
      }

      const collection = collectionSnap.data() as Collection
      const timestamp = new Date().toISOString()

      if (post.action === 'add') {
        // Create minimal stored post
        const storedPost: StoredPost = {
          id: Number(post.id),
          collectionType: post.collectionType,
        }

        // Check if post already exists
        const postExists = collection.posts.some(
          (p) => p.id === storedPost.id && p.collectionType === storedPost.collectionType,
        )

        if (postExists) {
          throw new Error('Post already in collection')
        }

        await updateDoc(collectionRef, {
          posts: [...collection.posts, storedPost],
          updatedAt: timestamp,
        })
      } else {
        // Remove post
        await updateDoc(collectionRef, {
          posts: collection.posts.filter(
            (p) => !(p.id === Number(post.id) && p.collectionType === post.collectionType),
          ),
          updatedAt: timestamp,
        })
      }

      return { collectionId, post }
    },
    onMutate: async ({ collectionId, post }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['collection', collectionId] })
      await queryClient.cancelQueries({ queryKey: ['collections', auth.currentUser?.uid] })

      // Snapshot the previous value
      const previousCollection = queryClient.getQueryData<Collection>(['collection', collectionId])

      // Optimistically update the collection
      if (previousCollection) {
        const optimisticCollection = {
          ...previousCollection,
          posts:
            post.action === 'add'
              ? [
                  ...previousCollection.posts,
                  { id: Number(post.id), collectionType: post.collectionType },
                ]
              : previousCollection.posts.filter(
                  (p) => !(p.id === Number(post.id) && p.collectionType === post.collectionType),
                ),
          updatedAt: new Date().toISOString(),
        }

        queryClient.setQueryData(['collection', collectionId], optimisticCollection)
      }

      return { previousCollection }
    },
    onError: (err, variables, context) => {
      // Revert the optimistic update
      if (context?.previousCollection) {
        queryClient.setQueryData(['collection', variables.collectionId], context.previousCollection)
      }
      toast.error('Failed to update collection')
    },
    onSuccess: (data, variables) => {
      if (!variables.skipToast) {
        toast.success(
          data.post.action === 'add' ? 'Added to collection!' : 'Removed from collection',
        )
      }
    },

    onSettled: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['collections', auth.currentUser?.uid] })
      queryClient.invalidateQueries({ queryKey: ['collection', data?.collectionId] })
    },
  })

  const collections = data?.pages.flatMap((page) => page.items) || []
  const hasMore = Boolean(hasNextPage && data?.pages[data.pages.length - 1]?.lastDoc)
  const totalCollections = data?.pages[0]?.total || 0

  const loadMore = async () => {
    if (!isFetchingNextPage && hasMore) {
      await fetchNextPage()
    }
  }
  // Return all necessary hooks and data
  return {
    collections,
    totalCollections,
    hasMore,
    loadMore,
    isFetchingMore: isFetchingNextPage,
    isLoading,
    error,
    createCollection,
    useCollection, // Single collection hook
    useCollectionPosts, // Collection posts hook
    updateCollection,
    deleteCollection,
    saveToCollection,
  } as const
}
