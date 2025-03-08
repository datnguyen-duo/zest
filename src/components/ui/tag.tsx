import { cn } from '@/utilities/cn'

interface TagProps {
  children: React.ReactNode
  collectionType: string
  className?: string
}

export const Tag = ({ children, collectionType, className }: TagProps) => {
  return (
    <span
      data-collection-type={collectionType}
      className={cn(
        // Base styles
        'inline-flex px-2 py-1 rounded-full text-sm',
        (collectionType === 'restaurants' || collectionType === 'restaurant-guides') &&
          'bg-teaGreen text-black',
        (collectionType === 'recipes' ||
          collectionType === 'ingredients' ||
          collectionType === 'techniques') &&
          'bg-dustyPink text-black',
        (collectionType === 'travel-guides' || collectionType === 'itineraries') &&
          'bg-khaki text-black',
        collectionType === 'pages' && 'bg-gray-200 text-black',
        className,
      )}
    >
      {children}
    </span>
  )
}
