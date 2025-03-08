import { CardSkeleton } from '../Card/CardSkeleton'

export const CollectionSkeleton = () => {
  return (
    <>
      <div className="flex flex-col bg-gray-100 p-4 rounded-lg animate-pulse">
        {/* Header section */}
        <div className="flex justify-between w-full items-start">
          <div className="flex flex-col gap-2">
            <div className="h-6 w-32 bg-gray-200 rounded" /> {/* Title */}
            <div className="h-4 w-48 bg-gray-200 rounded" /> {/* Description */}
          </div>
          <div className="h-4 w-4 bg-gray-200 rounded" /> {/* Action button */}
        </div>

        {/* Posts preview section */}
        <div className="flex gap-4 mt-4">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </>
  )
}
