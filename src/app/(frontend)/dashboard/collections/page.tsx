'use client'

import { useEffect, useState } from 'react'
import { auth } from '@/firebase.config'
import { onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { useCollections } from '@/hooks/useCollections'
import { CollectionSkeleton } from '@/components/Collections/CollectionSkeleton'
import { UserHeader } from '@/components/ui/userHeader'
import { FilterBarSkeleton } from '@/components/Filters/FilterBarSkeleton'
import { SortedCollectionContent } from '@/components/Filters/FilterContext/SortedCollectionContent'
import { FilterProvider } from '@/components/Filters/FilterContext'
interface User {
  uid: string
  photoURL: string
  displayName: string
}
export default function CollectionsPage() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const { collections, isLoading, hasMore, loadMore, isFetchingMore, totalCollections, error } =
    useCollections({
      limit: 8,
    })
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser as User)
      } else {
        router.push('/')
      }
    })

    return () => unsubscribe()
  }, [router])

  if (!user) return null

  if (error) return <div>{error.message}</div>

  if (isLoading) {
    return (
      <div className="mx-auto py-14 container">
        <UserHeader />
        <FilterBarSkeleton />
        <div className="flex flex-col gap-4">
          {[1, 2].map((i) => (
            <CollectionSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto py-14 container">
      <UserHeader />
      {collections.length === 0 ? (
        <p>You haven&apos;t created any collections yet.</p>
      ) : (
        <FilterProvider>
          <SortedCollectionContent
            collections={collections}
            hasMore={hasMore}
            loadMore={loadMore}
            isFetchingMore={isFetchingMore}
            totalCollections={totalCollections}
          />
        </FilterProvider>
      )}
    </div>
  )
}
