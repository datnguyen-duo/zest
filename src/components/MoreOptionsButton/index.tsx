import { useState, useRef, useEffect } from 'react'
import { FaEllipsisH } from 'react-icons/fa'
import { cn } from '@/utilities/cn'
import { usePopup } from '@/contexts/PopupContext'

interface MoreOptionsButtonProps {
  collectionId: string
}

export function MoreOptionsButton({ collectionId }: MoreOptionsButtonProps) {
  const { openCollectionPopup } = usePopup()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleClose = () => {
    menuRef.current?.classList.remove('popup-enter')
    menuRef.current?.classList.add('popup-exit')

    setTimeout(() => {
      setIsOpen(false)
    }, 300)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        handleClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleAction = (action: 'edit' | 'delete') => {
    openCollectionPopup(action, undefined, collectionId)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'bg-white rounded-full p-2 text-black hover:bg-gray-50 transition-colors',
          isOpen && 'bg-gray-50',
        )}
        aria-label="Share"
        aria-expanded={isOpen}
      >
        <FaEllipsisH />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute top-[110%] right-0 bg-white rounded-lg shadow-lg popup-enter z-50 overflow-hidden"
          role="menu"
        >
          <button
            className="flex items-center w-full whitespace-nowrap py-2 px-4 hover:bg-gray-100 transition-colors text-left"
            onClick={() => handleAction('edit')}
            role="menuitem"
          >
            Edit Collection
          </button>
          <button
            className="flex items-center w-full whitespace-nowrap py-2 px-4 hover:bg-gray-100 transition-colors text-left"
            onClick={() => handleAction('delete')}
            role="menuitem"
          >
            Delete Collection
          </button>
        </div>
      )}
    </div>
  )
}
