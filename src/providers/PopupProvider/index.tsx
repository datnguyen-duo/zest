import { useState, type ReactNode } from 'react'
import { toast } from 'react-hot-toast'
import { useCollections } from '@/hooks/useCollections'
import LoginPopup from '@/components/Popups/LoginPopup'
import CollectionPopup from '@/components/Popups/CollectionPopup'
import { PopupContext, type CollectionPopupState } from '@/contexts/PopupContext'

interface PopupProviderProps {
  children: ReactNode
}

export function PopupProvider({ children }: PopupProviderProps) {
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false)
  const [loginMessage, setLoginMessage] = useState('Login')
  const { createCollection, updateCollection, deleteCollection } = useCollections()

  const [collectionPopup, setCollectionPopup] = useState<CollectionPopupState>({
    isOpen: false,
    view: 'create',
  })

  const openCollectionPopup = (
    view: CollectionPopupState['view'],
    postData?: CollectionPopupState['postData'],
    collectionId?: string,
  ) => {
    setCollectionPopup({
      isOpen: true,
      view,
      postData,
      collectionId,
    })
  }

  const closeCollectionPopup = () => {
    setCollectionPopup((prev) => ({ ...prev, isOpen: false }))
  }

  const handleCreateSubmit = async (name: string, description?: string) => {
    try {
      if (collectionPopup.view === 'edit' && collectionPopup.collectionId) {
        await updateCollection.mutateAsync({
          id: collectionPopup.collectionId,
          name,
          description,
        })
      } else if (collectionPopup.view === 'save' && collectionPopup.postData) {
        await createCollection.mutateAsync({
          name,
          description,
          initalPost: {
            id: Number(collectionPopup.postData.id!),
            collectionType: collectionPopup.postData.collectionType!,
          },
        })
      } else if (collectionPopup.view === 'delete' && collectionPopup.collectionId) {
        await deleteCollection.mutateAsync(collectionPopup.collectionId)
      } else {
        await createCollection.mutateAsync({
          name,
          description,
        })
      }
      closeCollectionPopup()
    } catch (error) {
      console.error('Error creating collection:', error)
      toast.error('Failed to create collection')
    }
  }

  return (
    <PopupContext.Provider
      value={{
        isLoginPopupOpen,
        setIsLoginPopupOpen,
        collectionPopup,
        openCollectionPopup,
        closeCollectionPopup,
        loginMessage,
        setLoginMessage,
      }}
    >
      {children}
      {isLoginPopupOpen && (
        <LoginPopup isOpen={isLoginPopupOpen} onClose={() => setIsLoginPopupOpen(false)} />
      )}
      {collectionPopup.isOpen && (
        <CollectionPopup
          isOpen={collectionPopup.isOpen}
          onClose={closeCollectionPopup}
          initialView={collectionPopup.view}
          collectionId={collectionPopup.collectionId}
          postData={
            collectionPopup.postData && {
              id: Number(collectionPopup.postData.id),
              collectionType: collectionPopup.postData.collectionType!,
            }
          }
          onSubmit={handleCreateSubmit}
        />
      )}
    </PopupContext.Provider>
  )
}
