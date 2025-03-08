'use client'
import React from 'react'
import { useSearchModal } from '@/contexts/SearchContext'
import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { SearchInput } from '@/components/Search/SearchModal/SearchInput'
import { SearchResults } from '@/components/Search/SearchModal/SearchResults'

const PageClient: React.FC = () => {
  const { setSearchTerm } = useSearchModal()
  const searchParams = useSearchParams()
  const query = searchParams.get('q')

  // Set initial search term from URL query
  useEffect(() => {
    if (query) {
      setSearchTerm(query)
    }
  }, [query, setSearchTerm])

  return (
    <div className="container mb-16 pt-24">
      <div className="prose max-w-none mb-4">
        <h1 className="mb-8 lg:mb-16">Search</h1>
        <SearchInput />
      </div>
      <SearchResults variant="cards" />
    </div>
  )
}

export default PageClient
