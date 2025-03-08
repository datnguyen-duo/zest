import { useEffect, useState } from 'react'
import { cn } from '@/utilities/cn'

interface CarouselDotsProps {
  itemCount: number
  selectedIndex: number
  onDotClick: (index: number) => void
  dotsClassName?: string
  dotClassName?: string
  labels?: React.ReactNode[]
  autoplay?: boolean
  autoplayDelay?: number
  onProgressComplete?: () => void
  autoplayTimestamp: number // Add this prop
}

export function CarouselDots({
  itemCount,
  selectedIndex,
  onDotClick,
  dotsClassName,
  dotClassName,
  labels,
  autoplay,
  autoplayDelay = 4000,
  onProgressComplete,
  autoplayTimestamp,
}: CarouselDotsProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!autoplay) return

    setProgress(0)
    const startTime = autoplayTimestamp

    const intervalId = setInterval(() => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.min((elapsed / autoplayDelay) * 100, 100)
      setProgress(newProgress)

      if (newProgress === 100) {
        clearInterval(intervalId)
        onProgressComplete?.()
      }
    }, 16)

    return () => clearInterval(intervalId)
  }, [selectedIndex, autoplay, autoplayDelay, autoplayTimestamp, onProgressComplete])

  return (
    <div
      className={cn('absolute bottom-6 left-0 right-0 flex justify-center gap-2', dotsClassName)}
    >
      {Array.from({ length: itemCount }).map((_, index) => (
        <button
          key={index}
          className={cn(
            'bg-white py-2 px-4 rounded-full transition-all relative overflow-hidden',
            autoplay && 'bg-gray-50 text-gray-200',
            dotClassName,
          )}
          onClick={() => onDotClick(index)}
          aria-label={`Go to slide ${index + 1}`}
        >
          {labels?.[index] && <>{labels[index]}</>}
          {autoplay && selectedIndex === index && (
            <div
              className="absolute inset-0 bg-white overflow-hidden flex items-center justify-center text-black"
              style={{ clipPath: `inset(0 ${100 - progress}% 0 0)` }}
            >
              {labels?.[index]}
            </div>
          )}
        </button>
      ))}
    </div>
  )
}
