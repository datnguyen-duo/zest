'use client'

import { UserHeader } from '@/components/ui/userHeader'
import { FilterProvider } from '@/components/Filters/FilterContext'
import { FilteredContent } from '@/components/Filters/FilterContext/FilteredContent'
import { useLikedPosts } from '@/hooks/useLikedPosts'
import { useAuth } from '@/hooks/useAuth'
import { CardSkeleton } from '@/components/Card/CardSkeleton'
import { FilterBarSkeleton } from '@/components/Filters/FilterBarSkeleton'
import { FaHeart } from 'react-icons/fa'

export default function DashboardPage() {
  const { user } = useAuth()
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useLikedPosts(
    user?.uid || '',
  )

  if (!user) return null

  const likedPosts = data?.pages.flatMap((page) => page.docs) || []
  const totalPosts = data?.pages[0]?.totalDocs || 0

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }

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
        <FilteredContent
          totalPosts={totalPosts}
          posts={likedPosts}
          hasMore={hasNextPage}
          loadMore={loadMore}
          isLoading={isFetchingNextPage}
          label="Like"
          icon={<FaHeart />}
        />
      </FilterProvider>
    </div>
  )
}
