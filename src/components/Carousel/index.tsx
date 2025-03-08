'use client'
import React, { Fragment } from 'react'
import { EmblaOptionsType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import { useCallback, useEffect, useState } from 'react'
import { cn } from '@/utilities/cn'
import { CarouselDots } from './CarouselDots'
import { CarouselArrows } from './CarouselArrows'
import FadePlugin from 'embla-carousel-fade'

interface CarouselProps {
  children: React.ReactNode
  className?: string
  options?: EmblaOptionsType
  showDots?: boolean
  showArrows?: boolean
  autoplay?: boolean
  autoplayDelay?: number
  fade?: boolean
  dotsClassName?: string
  dotLabels?: React.ReactNode[]
  dotClassName?: string
}

export function Carousel({
  children,
  className,
  options = {},
  showDots = true,
  showArrows = true,
  autoplay = false,
  autoplayDelay = 4000,
  fade = false,
  dotsClassName,
  dotLabels,
  dotClassName,
}: CarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'start',
      containScroll: fade ? false : options.containScroll,
      ...options,
    },
    fade ? [FadePlugin()] : [],
  )

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])
  const [autoplayTimestamp, setAutoplayTimestamp] = useState(Date.now())

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) {
        emblaApi.scrollTo(index)
        setAutoplayTimestamp(Date.now())
      }
    },
    [emblaApi],
  )

  const handleProgressComplete = useCallback(() => {
    if (autoplay && emblaApi) {
      emblaApi.scrollNext()
      setAutoplayTimestamp(Date.now())
    }
  }, [autoplay, emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  // Initialize
  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    setScrollSnaps(emblaApi.scrollSnapList())
    emblaApi.on('select', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi, onSelect])

  return (
    <div className={cn('relative', className)}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className={cn('flex', fade && 'transition-opacity duration-500')}>{children}</div>
      </div>

      {showArrows && (
        <CarouselArrows
          onPrevious={() => {
            emblaApi?.scrollPrev()
            setAutoplayTimestamp(Date.now())
          }}
          onNext={() => {
            emblaApi?.scrollNext()
            setAutoplayTimestamp(Date.now())
          }}
        />
      )}

      {showDots && scrollSnaps.length > 1 && (
        <CarouselDots
          itemCount={scrollSnaps.length}
          selectedIndex={selectedIndex}
          onDotClick={scrollTo}
          labels={dotLabels || []}
          dotsClassName={dotsClassName}
          dotClassName={dotClassName}
          autoplay={autoplay}
          autoplayDelay={autoplayDelay}
          onProgressComplete={handleProgressComplete}
          autoplayTimestamp={autoplayTimestamp}
        />
      )}
    </div>
  )
}
