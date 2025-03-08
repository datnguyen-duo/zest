export const CommentDisplaySkeleton = () => {
  return (
    <div className="relative grid grid-cols-9 gap-10 rounded-lg p-4 bg-gray-100 mb-4">
      <div className="relative col-span-2 self-start">
        <div className="w-full bg-gray-200 rounded-lg animate-pulse aspect-square"></div>
      </div>
      <div className="col-span-7 flex flex-col gap-8">
        <div className="flex justify-between w-full">
          <div className="w-1/2 bg-gray-200 rounded-lg animate-pulse h-4"></div>
          <div className="w-40 bg-gray-200 rounded-lg animate-pulse h-4"></div>
        </div>
        <div className="w-full bg-gray-200 rounded-lg animate-pulse h-full "></div>
      </div>
    </div>
  )
}
