'use client'

import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PopupProvider } from './PopupProvider'
import LenisProvider from './LenisProvider'
import { SearchProvider } from '@/contexts/SearchContext'
const queryClient = new QueryClient()

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <SearchProvider>
        <LenisProvider>
          <PopupProvider>{children}</PopupProvider>
        </LenisProvider>
      </SearchProvider>
    </QueryClientProvider>
  )
}
