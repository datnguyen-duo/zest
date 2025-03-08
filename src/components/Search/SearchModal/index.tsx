import { useEffect, useRef } from 'react'
import { useSearchModal } from '@/contexts/SearchContext'
import { cn } from '@/utilities/cn'
import { FiX } from 'react-icons/fi'
import { SearchInput } from './SearchInput'
import { SearchResults } from './SearchResults'

export function SearchModal() {
  const { isOpen, closeModal } = useSearchModal()
  const popupRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  const handleClose = () => {
    popupRef.current?.classList.add('popup-exit')
    overlayRef.current?.classList.add('animate-fadeOut')
    setTimeout(() => {
      closeModal()
    }, 300)
  }
  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (overlayRef.current === event.target) {
        handleClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  })

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  })

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-white/40 backdrop-blur-md flex items-center justify-center w-full h-full animate-fadeIn"
      aria-hidden="true"
    >
      <div
        ref={popupRef}
        className={cn(
          'relative w-full max-h-[85vh] bg-white shadow-2xl max-w-2xl rounded-xl',
          'popup-enter',
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-modal-title"
      >
        {/* Close button */}

        {/* Search header */}
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h2 id="search-modal-title" className="text-lg font-semibold">
            Search
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-500 hover:text-gray-700"
            aria-label="Close search"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Search content - we'll add these components next */}
        <div className="p-4 space-y-4">
          <SearchInput />
          <div className="flex gap-4">
            <SearchResults />
          </div>
        </div>

        {/* Search footer */}
        <div className="px-4 py-3 text-xs text-gray-500 border-t">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <kbd className="px-2 py-1 bg-gray-100 rounded">↑↓</kbd>
              <span>to navigate</span>
            </div>
            <div className="flex gap-2">
              <kbd className="px-2 py-1 bg-gray-100 rounded">↵</kbd>
              <span>to select</span>
            </div>
            <div className="flex gap-2">
              <kbd className="px-2 py-1 bg-gray-100 rounded">esc</kbd>
              <span>to close</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
