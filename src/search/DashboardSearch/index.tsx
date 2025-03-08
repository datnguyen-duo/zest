import { useState, useEffect, useRef } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db, auth } from '@/firebase.config'
import Link from 'next/link'
import SearchBar from './SearchBar'
import SearchResults from './SearchResults'
import { Post } from '@/payload-types'

// Updated search result type to match Payload data
interface SearchResult {
  id: number
  title: string
  postUri: string
  collectionType: string
}

export default function DashboardSearch() {
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentQuery, setCurrentQuery] = useState('')
  const searchContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setCurrentQuery('')
        setResults([])
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const searchUserContent = async (query: string) => {
    setCurrentQuery(query)

    if (!query.trim() || !auth.currentUser) {
      setResults([])
      return
    }

    setIsLoading(true)
    try {
      // Get user document first
      const userDoc = doc(db, 'users', auth.currentUser.uid)
      const userSnapshot = await getDoc(userDoc)

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data()
        const likedPosts = userData.likedPosts || []

        const groupedPosts = likedPosts.reduce(
          (acc, post) => {
            const { collectionType, postId } = post
            if (!acc[collectionType]) {
              acc[collectionType] = []
            }
            acc[collectionType].push(postId)
            return acc
          },
          {} as Record<string, number[]>,
        )

        // Debug each fetch request
        const fetchPromises = Object.entries(groupedPosts).map(
          async ([collectionType, postIds]) => {
            const response = await fetch('/api/getPosts', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ postIds, collectionType }),
            })
            const posts = await response.json()
            return posts
          },
        )

        const postsResults = await Promise.all(fetchPromises)
        const allPosts = postsResults.flat()

        // Transform and filter posts
        const searchResults = allPosts
          .map((post: Post) => ({
            id: Number(post.id),
            title: post.title,
            collectionType: post.collectionType || '',
            postUri: `/${post.collectionType}/${post.slug}`,
            meta: post.meta,
            featuredImage: post.featuredImage,
          }))
          .filter(
            (post) =>
              post.title.toLowerCase().includes(query.toLowerCase()) ||
              post.postUri?.toLowerCase().includes(query.toLowerCase()),
          )

        setResults(searchResults)
      } else {
        setResults([])
      }
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative" ref={searchContainerRef}>
      <SearchBar placeholder="Search" onSearch={searchUserContent} />
      <SearchResults
        results={results}
        isLoading={isLoading}
        query={currentQuery}
        renderItem={(result) => (
          <Link href={result.postUri}>
            <div className="flex items-center gap-2">
              <span className="text-sm border border-gray-200 rounded-full px-2 py-1 bg-gray-100 text-gray-500">
                {result.collectionType.charAt(0).toUpperCase() + result.collectionType.slice(1)}
              </span>
              <h4 className="font-medium">{result.title}</h4>
            </div>
          </Link>
        )}
      />
    </div>
  )
}
