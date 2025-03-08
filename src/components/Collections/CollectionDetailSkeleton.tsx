import { FilterBarSkeleton } from '../Filters/FilterBarSkeleton'

export function CollectionDetailSkeleton() {
  return (
    <>
      {/* Header Skeleton */}
      <div className="relative mb-8 text-center h-96 flex flex-col justify-center items-center bg-gray-100 animate-pulse">
        <div className="h-8 w-64 bg-gray-200 rounded mb-2" /> {/* Title */}
        <div className="h-4 w-48 bg-gray-200 rounded mb-4" /> {/* Description */}
        <div className="h-4 w-32 bg-gray-200 rounded" /> {/* Owner */}
        {/* Bottom Bar */}
        <div className="absolute max-w-4xl w-full mx-auto bottom-4 left-0 right-0 flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-gray-200 rounded-full" /> {/* Back button */}
            <div className="h-4 w-24 bg-gray-200 rounded" /> {/* Posts count */}
            <div className="h-4 w-32 bg-gray-200 rounded" /> {/* Created date */}
          </div>
          <div className="flex items-center gap-4">
            <div className="h-4 w-32 bg-gray-200 rounded" /> {/* Updated date */}
            <div className="h-8 w-8 bg-gray-200 rounded-full" /> {/* Share */}
            <div className="h-8 w-8 bg-gray-200 rounded-full" /> {/* More */}
          </div>
        </div>
      </div>
      {/* Filter Bar Skeleton */}
      <div className="max-w-4xl mx-auto">
        <FilterBarSkeleton />
      </div>
      {/* Posts Grid Skeleton */}
      <div className="max-w-4xl mx-auto grid gap-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="flex flex-col animate-pulse">
            <div className="h-48 bg-gray-200 rounded-lg mb-2" /> {/* Image */}
            <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" /> {/* Title */}
            <div className="h-4 w-1/2 bg-gray-200 rounded mb-4" /> {/* Categories */}
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-gray-200 rounded-full" /> {/* Like */}
              <div className="h-8 w-8 bg-gray-200 rounded-full" /> {/* Save */}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
