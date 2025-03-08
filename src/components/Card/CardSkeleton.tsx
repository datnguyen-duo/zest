export const CardSkeleton = () => {
  return (
    <article className="w-full">
      {/* Image placeholder */}
      <div className="relative aspect-square overflow-hidden rounded-xl mb-4 bg-gray-200 animate-pulse">
        {/* Actions placeholder */}
        <div className="absolute bottom-2 right-2 flex gap-2">
          <div className="h-8 w-8 rounded-full bg-gray-300" />
          <div className="h-8 w-8 rounded-full bg-gray-300" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {/* Categories placeholder */}
        <div className="flex gap-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
          ))}
        </div>

        {/* Title placeholder */}
        <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" />
      </div>
    </article>
  )
}
