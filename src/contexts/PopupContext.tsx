import { createContext, useContext } from 'react'
// import type { Post } from '@/payload-types'

// Types
export type PostData = {
  id: number
  collectionType: string
}

export type CollectionPopupState = {
  isOpen: boolean
  view: 'create' | 'save' | 'edit' | 'delete'
  postData?: PostData
  collectionId?: string
}

export type PopupContextType = {
  isLoginPopupOpen: boolean
  setIsLoginPopupOpen: (open: boolean) => void
  collectionPopup: CollectionPopupState
  openCollectionPopup: (
    view: 'create' | 'save' | 'edit' | 'delete',
    postData?: CollectionPopupState['postData'],
    collectionId?: string,
  ) => void
  closeCollectionPopup: () => void
  loginMessage: string
  setLoginMessage: (message: string) => void
}

// Context
export const PopupContext = createContext<PopupContextType | undefined>(undefined)

// Hook
export function usePopup() {
  const context = useContext(PopupContext)
  if (context === undefined) {
    throw new Error('usePopup must be used within a PopupProvider')
  }
  return context
}
