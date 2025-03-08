import { useState, useRef, useEffect } from 'react'
import { FaCopy, FaShareAlt, FaFacebook, FaTwitter } from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import { cn } from '@/utilities/cn'

export const ShareButton = ({ text }: { text: string }) => {
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

  const handleShare = async (type: 'copy' | 'facebook' | 'twitter') => {
    switch (type) {
      case 'copy':
        try {
          await navigator.clipboard.writeText(text)
          toast.success('Copied to clipboard')
        } catch (error) {
          console.error(error)
          toast.error('Failed to copy')
        }
        break
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(text)}`,
          '_blank',
          'noopener,noreferrer',
        )
        break
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(text)}`,
          '_blank',
          'noopener,noreferrer',
        )
        break
    }
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
        <FaShareAlt />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute top-[110%] right-0 bg-white rounded-lg shadow-lg popup-enter z-50 overflow-hidden"
          role="menu"
        >
          <button
            className="flex items-center gap-2 w-full whitespace-nowrap py-2 px-4 hover:bg-gray-100 transition-colors text-left"
            onClick={() => handleShare('copy')}
            role="menuitem"
          >
            <FaCopy className="flex-shrink-0" />
            Copy to clipboard
          </button>
          <button
            className="flex items-center gap-2 w-full whitespace-nowrap py-2 px-4 hover:bg-gray-100 transition-colors text-left"
            onClick={() => handleShare('facebook')}
            role="menuitem"
          >
            <FaFacebook className="flex-shrink-0" />
            Share on Facebook
          </button>
          <button
            className="flex items-center gap-2 w-full whitespace-nowrap py-2 px-4 hover:bg-gray-100 transition-colors text-left"
            onClick={() => handleShare('twitter')}
            role="menuitem"
          >
            <FaTwitter className="flex-shrink-0" />
            Share on Twitter
          </button>
        </div>
      )}
    </div>
  )
}
