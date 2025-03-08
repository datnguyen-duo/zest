'use client'

import { useEffect, useState } from 'react'
import { auth } from '@/firebase.config'
import { onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { UserHeader } from '@/components/ui/userHeader'
import { useUserContent } from '@/components/Comments/hooks/useUserContent'
import { SortedRatingsContent } from '@/components/Filters/FilterContext/SortedRatingsContent'
import { FilterProvider } from '@/components/Filters/FilterContext'
import { FilterBarSkeleton } from '@/components/Filters/FilterBarSkeleton'
import { CardSkeleton } from '@/components/Card/CardSkeleton'

interface User {
  uid: string
  photoURL: string
  displayName: string
}

export default function RatingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const { comments, isLoading, error, hasMore, loadMore, isFetchingMore, totalComments } =
    useUserContent(user?.uid, 8)

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
        <div className="mx-auto grid gap-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto py-14 container">
      <UserHeader />
      <FilterProvider>
        <SortedRatingsContent
          comments={comments}
          isLoading={isLoading}
          hasMore={hasMore}
          loadMore={loadMore}
          isFetching={isFetchingMore}
          totalRatings={totalComments}
        />
      </FilterProvider>
    </div>
  )
}
