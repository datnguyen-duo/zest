'use client'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { cn } from '@/utilities/cn'

interface CarouselArrowsProps {
  onPrevious?: () => void
  onNext?: () => void
  className?: string
}

export function CarouselArrows({ onPrevious, onNext, className }: CarouselArrowsProps) {
  return (
    <div className={cn('absolute inset-0 pointer-events-none', className)}>
      <button
        onClick={onPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/80 rounded-full shadow-lg pointer-events-auto transition hover:bg-white"
        aria-label="Previous slide"
      >
        <FiChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={onNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/80 rounded-full shadow-lg pointer-events-auto transition hover:bg-white"
        aria-label="Next slide"
      >
        <FiChevronRight className="w-6 h-6" />
      </button>
    </div>
  )
}
