import { cn } from '@/utilities/cn'

interface CarouselSlideProps {
  children: React.ReactNode
  className?: string
}

export function CarouselSlide({ children, className }: CarouselSlideProps) {
  return <div className={cn('flex-[0_0_100%] min-w-0', className)}>{children}</div>
}
