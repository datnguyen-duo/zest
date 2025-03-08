'use client'

import { useState, useRef } from 'react'
import { auth } from '@/firebase.config'
import { usePopup } from '@/contexts/PopupContext'
import { FiPlus } from 'react-icons/fi'

interface SaveButtonProps {
  postId: number
  collectionType: string
}

export const SaveButton = ({ postId, collectionType }: SaveButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const { openCollectionPopup, setIsLoginPopupOpen, setLoginMessage } = usePopup()
  const user = auth.currentUser

  const handleSave = () => {
    if (!user) {
      setLoginMessage('Please log in to continue')
      setIsLoginPopupOpen(true)
      return
    }

    openCollectionPopup('save', {
      id: postId,
      collectionType: collectionType,
    })
  }

  return (
    <button
      ref={buttonRef}
      onClick={handleSave}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="text-black-500 p-2 rounded-full bg-white text-sm"
      aria-label="Save to collection"
    >
      <FiPlus className="h-4 w-4" />
    </button>
  )
}
