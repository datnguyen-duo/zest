import { CardData } from './'
import { cn } from '@/utilities/cn'

interface CardTaxonomiesProps {
  data: CardData
  className?: string
  taxonomyLimit?: number
}

export const CardTaxonomies = ({ data, className, taxonomyLimit }: CardTaxonomiesProps) => {
  if (!data) return null

  const renderTaxonomies = () => {
    switch (data.collectionType) {
      case 'restaurants':
        return (
          <div className={cn('flex flex-wrap gap-2', className)}>
            {/* Priority 1 */}
            {data.priceLevel && (
              <span className="text-sm text-gray-600">{data.priceLevel.title}</span>
            )}
            {/* Priority 2 */}
            {(!taxonomyLimit || taxonomyLimit > 1) &&
              data.cuisines?.map((cuisine, index) => (
                <span key={cuisine.id} className="text-sm text-gray-600">
                  {cuisine.title}
                  {index < (data.cuisines?.length || 0) - 1 && ', '}
                </span>
              ))}
            {/* Priority 3 */}
            {(!taxonomyLimit || taxonomyLimit > 2) && data.destination && (
              <span className="text-sm text-gray-600">{data.destination.title}</span>
            )}
            {/* Priority 4 */}
            {(!taxonomyLimit || taxonomyLimit > 3) &&
              data.moods?.map((mood, index) => (
                <span key={mood.id} className="text-sm text-gray-600">
                  {mood.title}
                  {index < (data.moods?.length || 0) - 1 && ', '}
                </span>
              ))}
          </div>
        )

      case 'recipes':
        return (
          <div className={cn('flex flex-wrap gap-2', className)}>
            {/* Priority 1 */}
            {data.mealType && <span className="text-sm text-gray-600">{data.mealType.title}</span>}
            {/* Priority 2 */}
            {(!taxonomyLimit || taxonomyLimit > 1) && data.difficultyLevel && (
              <span className="text-sm text-gray-600">{data.difficultyLevel.title}</span>
            )}
            {/* Priority 3 */}
            {(!taxonomyLimit || taxonomyLimit > 2) &&
              data.diet?.map((diet, index) => (
                <span key={diet.id} className="text-sm text-gray-600">
                  {diet.title}
                  {index < (data.diet?.length || 0) - 1 && ', '}
                </span>
              ))}
          </div>
        )

      case 'travel-guides':
      case 'itineraries':
        return (
          <div className={cn('flex flex-wrap gap-2', className)}>
            {/* Priority 1 */}
            {data.travelStyle && (
              <span className="text-sm text-gray-600">{data.travelStyle.title}</span>
            )}
            {/* Priority 2 */}
            {(!taxonomyLimit || taxonomyLimit > 1) && data.region && (
              <span className="text-sm text-gray-600">{data.region.title}</span>
            )}
            {/* Priority 3 */}
            {(!taxonomyLimit || taxonomyLimit > 2) &&
              data.environment?.map((env, index) => (
                <span key={env.id} className="text-sm text-gray-600">
                  {env.title}
                  {index < (data.environment?.length || 0) - 1 && ', '}
                </span>
              ))}
          </div>
        )

      default:
        return null
    }
  }

  return renderTaxonomies()
}
