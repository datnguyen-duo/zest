'use client'

import { useState, useEffect } from 'react'
import { auth } from '@/firebase.config'
import { onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'next/navigation'

interface User {
  uid: string
  photoURL: string
  displayName: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser as User)
      } else {
        setUser(null)
        router.push('/')
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  return { user, isLoading }
}
