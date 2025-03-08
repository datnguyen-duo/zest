'use client'

import React, { useState, useLayoutEffect } from 'react'
import { db, auth } from '@/firebase.config'
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore'
import { usePopup } from '@/contexts/PopupContext'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import { toast } from 'react-hot-toast'

interface LikeButtonProps {
  collectionType: string
  postId: number
}

export const LikeButton: React.FC<LikeButtonProps> = ({ collectionType, postId }) => {
  const [isLiked, setIsLiked] = useState(false)
  const { setIsLoginPopupOpen, setLoginMessage } = usePopup()

  useLayoutEffect(() => {
    const checkIfLiked = async () => {
      if (!auth.currentUser) {
        const unsubscribe = auth.onAuthStateChanged((user) => {
          if (user) {
            fetchLikedState(user.uid)
          }
        })
        return unsubscribe
      } else {
        fetchLikedState(auth.currentUser.uid)
      }
    }

    const fetchLikedState = async (userId: string) => {
      try {
        const userRef = doc(db, 'users', userId)
        const userDoc = await getDoc(userRef)

        if (userDoc.exists()) {
          const likedPosts = userDoc.data().likedPosts || []

          const isAlreadyLiked = likedPosts.some(
            (post: { postId: number; collectionType: string }) =>
              post.postId === postId && post.collectionType === collectionType,
          )

          setIsLiked(isAlreadyLiked)
        }
      } catch (error) {
        console.error('Error checking liked state:', error)
      }
    }

    checkIfLiked()
  }, [postId, collectionType])

  const handleToggleLike = async () => {
    if (!auth.currentUser) {
      setLoginMessage('Please log in to continue')
      setIsLoginPopupOpen(true)
      return
    }

    try {
      const userRef = doc(db, 'users', auth.currentUser.uid)
      const postData = {
        collectionType,
        postId,
      }

      if (isLiked) {
        // First fetch current likes to find exact object to remove
        const userDoc = await getDoc(userRef)
        const currentLikes = userDoc.data()?.likedPosts || []
        const exactPost = currentLikes.find((post: { postId: number }) => post.postId === postId)

        if (exactPost) {
          await updateDoc(userRef, {
            likedPosts: arrayRemove(exactPost),
          })
          toast.success('Post removed from liked!')
        }
      } else {
        await updateDoc(userRef, {
          likedPosts: arrayUnion(postData),
        })
        toast.success('Post liked!')
      }

      setIsLiked(!isLiked)
    } catch (error) {
      console.error('Error toggling like state:', error)
      toast.error('Failed to update. Please try again.')
    }
  }

  return (
    <button onClick={handleToggleLike} className="text-black-500 p-2 rounded-full bg-white text-sm">
      {isLiked ? <FaHeart /> : <FaRegHeart />}
    </button>
  )
}
