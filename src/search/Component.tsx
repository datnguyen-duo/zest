'use client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React, { useState, useEffect } from 'react'
import { useDebounce } from '@/utilities/useDebounce'
import { useRouter, useSearchParams } from 'next/navigation'
import Spinner from '@/components/ui/spinner'
export const Search: React.FC = () => {
  const searchParams = useSearchParams()
  const initialValue = searchParams.get('q')
  const [value, setValue] = useState(initialValue || '')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const debouncedValue = useDebounce(value)

  useEffect(() => {
    router.push(`/search${debouncedValue ? `?q=${debouncedValue}` : ''}`)
    setIsLoading(false)
  }, [debouncedValue, router])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
      }}
    >
      <div className="relative">
        <Input
          id="search"
          onChange={(event) => {
            setValue(event.target.value)
            setIsLoading(true)
          }}
          placeholder=""
        />
        <Label htmlFor="search">Search for anything</Label>
        {isLoading && <Spinner className="absolute right-3 top-4" />}
      </div>
      <button type="submit" className="sr-only">
        submit
      </button>
    </form>
  )
}
