import { cn } from '@/utilities/cn'
import * as React from 'react'

const Input: React.FC<
  {
    ref?: React.Ref<HTMLInputElement>
  } & React.InputHTMLAttributes<HTMLInputElement>
> = ({ type, className, ref, ...props }) => {
  return (
    <input
      className={cn(
        'w-full border-b py-2 peer pt-4 pb-2 focus:outline-none focus:border-black',
        className,
      )}
      ref={ref}
      type={type}
      {...props}
    />
  )
}

export { Input }
