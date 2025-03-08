import { useEffect, useRef, useState, useMemo } from 'react'
import { auth } from '@/firebase.config'
import { FaPlus, FaTrash } from 'react-icons/fa'
import { usePopup } from '@/contexts/PopupContext'
import Spinner from '@/components/ui/spinner'
import { toast } from 'react-hot-toast'
import { cn } from '@/utilities/cn'
import { useCollections } from '@/hooks/useCollections'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface CollectionPopupProps {
  isOpen: boolean
  onClose: () => void
  initialView?: 'create' | 'save' | 'edit' | 'delete'
  postData?: {
    id: number
    collectionType: string
  }
  collectionId?: string
  onSubmit: (name: string, description?: string) => Promise<void>
}

export default function CollectionPopup({
  isOpen,
  onClose,
  initialView = 'save',
  postData,
  collectionId,
  onSubmit,
}: CollectionPopupProps) {
  const [selectedCollections, setSelectedCollections] = useState<string[]>([])
  const [existingCollections, setExistingCollections] = useState<string[]>([])
  const [showCreateForm, setShowCreateForm] = useState(
    initialView === 'create' || initialView === 'edit',
  )
  const [newCollectionName, setNewCollectionName] = useState('')
  const [newCollectionDesc, setNewCollectionDesc] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const { setIsLoginPopupOpen, setLoginMessage } = usePopup()
  // At the top of your component, after the props destructuring
  const collectionOptions = useMemo(() => ({ limit: 8 }), [])
  const {
    collections,
    createCollection,
    saveToCollection,
    updateCollection,
    isLoading: isCollectionsLoading,
  } = useCollections(collectionOptions)
  const popupRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      if (initialView === 'save' && postData) {
        const postId = Number(postData.id)
        const existing = collections
          .filter((collection) =>
            collection.posts?.some(
              (post) => post.id === postId && post.collectionType === postData.collectionType,
            ),
          )
          .map((collection) => collection.id)

        setExistingCollections((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(existing)) return prev
          return existing
        })
        setSelectedCollections((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(existing)) return prev
          return existing
        })
      }
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Failed to load data')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, collections.length, initialView, postData?.id, postData?.collectionType])

  const handleClose = () => {
    if (popupRef.current) {
      popupRef.current.classList.add('popup-exit')
      overlayRef.current?.classList.add('animate-fadeOut')
      setTimeout(() => {
        onClose()
        setShowCreateForm(initialView === 'create')
        setNewCollectionName('')
        setNewCollectionDesc('')
        setSelectedCollections([])
        setShowDeleteConfirm(null)
      }, 300)
    }
  }

  const handleCollectionClick = (collectionId: string) => {
    setSelectedCollections((prev) => {
      const next = prev.includes(collectionId)
        ? prev.filter((id) => id !== collectionId)
        : [...prev, collectionId]

      return next
    })
  }

  const hasChanges = () => {
    if (!postData) return false

    // Get collections that have been selected but don't contain this post
    const additions = selectedCollections.filter((collectionId) => {
      const collection = collections.find((c) => c.id === collectionId)
      return !collection?.posts?.some(
        (post) => post.id === postData.id && post.collectionType === postData.collectionType,
      )
    })

    // Get collections that contain this post but are no longer selected
    const removals = existingCollections.filter((collectionId) => {
      const collection = collections.find((c) => c.id === collectionId)
      return (
        collection?.posts?.some(
          (post) => post.id === postData.id && post.collectionType === postData.collectionType,
        ) && !selectedCollections.includes(collectionId)
      )
    })

    return additions.length > 0 || removals.length > 0
  }
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!auth.currentUser) {
      setLoginMessage('Please log in to create collections')
      setIsLoginPopupOpen(true)
      return
    }

    setIsSaving(true)
    try {
      if (initialView === 'edit' && collectionId) {
        // Handle edit first
        await updateCollection.mutateAsync({
          id: collectionId,
          name: newCollectionName,
          description: newCollectionDesc,
        })
        toast.success('Collection updated!')
      } else {
        // Handle create
        const newCollection = await createCollection.mutateAsync({
          name: newCollectionName,
          description: newCollectionDesc,
        })

        if (postData) {
          await saveToCollection.mutateAsync({
            collectionId: newCollection.id,
            post: {
              id: postData.id,
              collectionType: postData.collectionType,
              action: 'add',
            },
            skipToast: true,
          })
          toast.success('Created collection and saved item!')
        } else {
          toast.success('Collection created!')
        }
      }

      handleClose()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to create collection')
    } finally {
      setTimeout(() => {
        setIsSaving(false)
      }, 1000)
    }
  }

  // Update button text logic
  const getButtonText = () => {
    if (saveToCollection.isPending) {
      return (
        <div className="flex items-center justify-center gap-2">
          <Spinner />
        </div>
      )
    }

    if (!hasChanges()) {
      return 'No changes to save'
    }

    const additions = selectedCollections.filter((collectionId) => {
      const collection = collections.find((c) => c.id === collectionId)
      return !collection?.posts?.some(
        (post) => post.id === postData?.id && post.collectionType === postData?.collectionType,
      )
    })

    const removals = existingCollections.filter((collectionId) => {
      const collection = collections.find((c) => c.id === collectionId)
      return (
        collection?.posts?.some(
          (post) => post.id === postData?.id && post.collectionType === postData?.collectionType,
        ) && !selectedCollections.includes(collectionId)
      )
    })

    if (additions.length > 0 && removals.length > 0) {
      return 'Update collections'
    }

    if (additions.length > 0) {
      return `Add to ${additions.length} collection${additions.length > 1 ? 's' : ''}`
    }

    if (removals.length > 0) {
      return `Remove from ${removals.length} collection${removals.length > 1 ? 's' : ''}`
    }

    return 'Save changes'
  }

  return (
    <div ref={overlayRef} className="overlay" onClick={handleClose}>
      <div
        ref={popupRef}
        className="bg-white rounded-lg pb-6 pt-12 px-6 w-full max-w-md relative z-50 text-secondary collection-popup-content popup-enter"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
        >
          ✕
        </button>

        {!showDeleteConfirm && initialView !== 'delete' && (
          <h1 className="text-2xl font-bold mb-4 text-center">
            {initialView === 'edit'
              ? 'Edit Collection'
              : initialView === 'save'
                ? 'Save to Collection'
                : 'Create Collection'}
          </h1>
        )}

        {showCreateForm && !showDeleteConfirm && initialView !== 'delete' && (
          // Create Collection Form
          <form className="space-y-4" onSubmit={handleSubmitForm}>
            <div className="relative">
              <Input
                type="text"
                id="collectionName"
                value={newCollectionName}
                placeholder=""
                onChange={(e) => setNewCollectionName(e.target.value)}
                className="w-full border-b py-2 peer pt-4 pb-2 focus:outline-none focus:border-black"
                required
              />
              <Label
                htmlFor="collectionName"
                className="absolute pointer-events-none text-gray-500 duration-300 transform -translate-y-5 scale-75 top-4 z-10 origin-[0] left-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-5"
              >
                Collection Name
              </Label>
            </div>

            <div className="relative">
              <textarea
                id="description"
                value={newCollectionDesc}
                placeholder=""
                onChange={(e) => setNewCollectionDesc(e.target.value)}
                className="w-full border-b py-2 peer pt-4 pb-2 focus:outline-none focus:border-black"
                rows={3}
              />
              <Label
                htmlFor="description"
                className="absolute pointer-events-none text-gray-500 duration-300 transform -translate-y-5 scale-75 top-4 z-10 origin-[0] left-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-5"
              >
                Description (optional)
              </Label>
            </div>

            <button
              type="submit"
              disabled={isSaving || !newCollectionName.trim()}
              className="w-full bg-black text-white p-2 rounded hover:bg-black/80 disabled:opacity-50"
            >
              {isSaving ? (
                <div className="flex items-center justify-center gap-2">
                  <Spinner />
                </div>
              ) : postData ? (
                'Create & Save'
              ) : initialView === 'edit' ? (
                'Update Collection'
              ) : (
                'Create Collection'
              )}
            </button>
          </form>
        )}

        {!showCreateForm && !showDeleteConfirm && initialView !== 'delete' && (
          // Save to Collection View
          <>
            {isCollectionsLoading ? (
              <div className="flex justify-center items-center py-8">
                <Spinner />
              </div>
            ) : collections.length > 0 ? (
              <>
                <div className="space-y-2 mb-4 overflow-y-auto max-h-[300px]">
                  {collections.map((collection) => (
                    <div
                      className="flex items-center justify-between relative group"
                      key={collection.id}
                    >
                      <button
                        className={cn(
                          'flex flex-col w-full text-left p-3 rounded-lg transition-colors border hover:bg-gray-50',
                          selectedCollections.includes(collection.id) && 'border border-black',
                        )}
                        onClick={() => handleCollectionClick(collection.id)}
                      >
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium">{collection.name}</h3>
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          {collection.posts && (
                            <p className="text-xs text-gray-400">
                              {collection.posts.length} item
                              {collection.posts.length > 1 && 's'}
                            </p>
                          )}
                        </div>
                      </button>
                      <button
                        className="absolute top-0 right-2 bottom-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        onClick={() => setShowDeleteConfirm(collection.id)}
                      >
                        <FaTrash className="opacity-20" />
                      </button>
                    </div>
                  ))}
                </div>
                {postData && hasChanges() && (
                  <button
                    onClick={() => {
                      const additions = selectedCollections.filter((collectionId) => {
                        const collection = collections.find((c) => c.id === collectionId)
                        return !collection?.posts?.some(
                          (post) =>
                            post.id === postData.id &&
                            post.collectionType === postData.collectionType,
                        )
                      })

                      const removals = existingCollections.filter((collectionId) => {
                        const collection = collections.find((c) => c.id === collectionId)
                        return (
                          collection?.posts?.some(
                            (post) =>
                              post.id === postData.id &&
                              post.collectionType === postData.collectionType,
                          ) && !selectedCollections.includes(collectionId)
                        )
                      })

                      Promise.all([
                        ...additions.map((collectionId) =>
                          saveToCollection.mutateAsync({
                            collectionId,
                            post: {
                              id: postData.id,
                              collectionType: postData.collectionType,
                              action: 'add',
                            },
                          }),
                        ),
                        ...removals.map((collectionId) =>
                          saveToCollection.mutateAsync({
                            collectionId,
                            post: {
                              id: postData.id,
                              collectionType: postData.collectionType,
                              action: 'remove',
                            },
                          }),
                        ),
                      ]).then(() => {
                        handleClose()
                      })
                    }}
                    disabled={saveToCollection.isPending || !hasChanges()}
                    className="w-full bg-black text-white p-2 rounded hover:bg-black/80 disabled:opacity-50 mb-4"
                  >
                    {getButtonText()}
                  </button>
                )}
              </>
            ) : (
              <p className="text-center text-gray-500 mb-4">
                You don&apos;t have any collections yet
              </p>
            )}

            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full flex items-center justify-center gap-2 p-2 border border-black rounded hover:bg-gray-50"
            >
              <FaPlus className="w-4 h-4" />
              Create New Collection
            </button>
          </>
        )}

        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

        {showCreateForm && initialView !== 'create' && initialView !== 'edit' && (
          <p
            onClick={() => setShowCreateForm(false)}
            className="text-center mt-4 text-sm cursor-pointer text-blue-600 hover:underline"
          >
            Back to Collections
          </p>
        )}

        {(initialView === 'delete' || showDeleteConfirm) && (
          <div className="inset-0 bg-white rounded-lg p-6 flex flex-col items-center justify-center">
            <h2 className="text-xl font-bold mb-4">Delete Collection?</h2>
            <p className="text-gray-500 mb-6 text-center text-balance">
              This action cannot be undone. All saved items will be removed.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => onSubmit('', '')} // Delete doesn't need name/description
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
