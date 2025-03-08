'use client'

import { cn } from '@/utilities/cn'
import { FaStar } from 'react-icons/fa'
interface RatingInputProps {
  value?: number
  onChange: (rating: number) => void
  disabled?: boolean
  className?: string
  size?: 'sm' | 'md'
}

export default function RatingInput({
  value = 0,
  onChange,
  disabled = false,
  className,
  size = 'md',
}: RatingInputProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          disabled={disabled}
          className="text-2xl"
        >
          {star <= (value || 0) ? (
            <FaStar className={cn('text-schoolBusYellow', size === 'sm' && 'text-[18px]')} />
          ) : (
            <FaStar className={cn('text-gray-200', size === 'sm' && 'text-[18px]')} />
          )}
        </button>
      ))}
    </div>
  )
}
