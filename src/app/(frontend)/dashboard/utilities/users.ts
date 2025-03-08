import { auth, db } from '@/firebase.config'
import {
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
  verifyBeforeUpdateEmail,
} from 'firebase/auth'
import { deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore'
import { toast } from 'react-hot-toast'

export async function updateUserProfile(data: {
  displayName?: string
  photoURL?: string
  email?: string
  password?: string
  notificationSettings?: {
    newsletters: boolean
  }
}) {
  if (!auth.currentUser) throw new Error('No user logged in')
  try {
    // Update Auth first (if auth-related fields exist)
    if (data.displayName) {
      await updateProfile(auth.currentUser, {
        displayName: data.displayName,
      })

      // Sync to Firestore with both name and displayName
      const userRef = doc(db, 'users', auth.currentUser.uid)
      await updateDoc(userRef, {
        name: data.displayName, // Update the name field
        displayName: data.displayName, // Update the displayName field
        updatedAt: new Date().toISOString(),
      })
    }
    // Then sync to Firestore
    const userRef = doc(db, 'users', auth.currentUser.uid)
    await updateDoc(userRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    })

    toast.success('Profile updated successfully!')
    return true
  } catch (error) {
    console.error('Error updating profile:', error)
    toast.error('Failed to update profile')
    return false
  }
}

// Function to reauthenticate user
export async function reauthenticateUser(currentPassword: string) {
  if (!auth.currentUser?.email) throw new Error('No user email found')

  const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword)

  await reauthenticateWithCredential(auth.currentUser, credential)
}

export async function updateUserEmail(newEmail: string, currentPassword: string) {
  if (!auth.currentUser) throw new Error('No user logged in')

  try {
    // Reauthenticate first
    await reauthenticateUser(currentPassword)

    // Send verification to new email and update it when verified
    await verifyBeforeUpdateEmail(auth.currentUser, newEmail)

    // Update Firestore with pending email
    const userRef = doc(db, 'users', auth.currentUser.uid)
    await updateDoc(userRef, {
      pendingEmail: newEmail,
      updatedAt: new Date().toISOString(),
    })

    toast.success('Verification email sent. Please check your new email address.')
    return true
  } catch (error) {
    console.error('Error updating email:', error)
    if (error.code === 'auth/requires-recent-login') {
      toast.error('Please log in again to change your email')
    } else if (error.code === 'auth/email-already-in-use') {
      toast.error('This email is already in use')
    } else {
      toast.error('Failed to update email')
    }
    return false
  }
}

export async function checkAndUpdateEmail() {
  if (!auth.currentUser) return false

  try {
    const userRef = doc(db, 'users', auth.currentUser.uid)
    const userDoc = await getDoc(userRef)
    const userData = userDoc.data()

    // If there's a pending email and it matches current auth email
    if (userData?.pendingEmail && auth.currentUser.email === userData.pendingEmail) {
      await updateDoc(userRef, {
        email: auth.currentUser.email, // Use current auth email
        pendingEmail: null,
        updatedAt: new Date().toISOString(),
      })
      toast.success('Email updated successfully!')
      return true
    }

    // If auth email doesn't match Firestore email (handles direct auth changes)
    if (userData?.email !== auth.currentUser.email) {
      await updateDoc(userRef, {
        email: auth.currentUser.email,
        pendingEmail: null,
        updatedAt: new Date().toISOString(),
      })
      toast.success('Email updated successfully!')
      return true
    }

    return false
  } catch (error) {
    console.error('Error checking email status:', error)
    return false
  }
}

// Update password with reauthentication
export async function updateUserPassword(currentPassword: string, newPassword: string) {
  if (!auth.currentUser) throw new Error('No user logged in')

  try {
    // Reauthenticate first
    await reauthenticateUser(currentPassword)

    // Then update password
    await updatePassword(auth.currentUser, newPassword)

    toast.success('Password updated successfully!')

    return true
  } catch (error) {
    console.error('Error updating password:', error)
    if (error.code === 'auth/wrong-password') {
      toast.error('Incorrect current password')
    } else {
      toast.error('Failed to update password')
    }
    return false
  }
}

export async function getNotificationSettings(uid: string) {
  try {
    const userRef = doc(db, 'users', uid)
    const userDoc = await getDoc(userRef)
    const userData = userDoc.data()

    // Check if notificationSettings exists, if not return default
    return userData?.notificationSettings ?? { newsletters: false }
  } catch (error) {
    console.error('Error getting notification settings:', error)
    return { newsletters: false }
  }
}

export async function deleteUserAccount(password: string) {
  if (!auth.currentUser) throw new Error('No user logged in')

  try {
    // Re-authenticate first
    await reauthenticateUser(password)

    // Delete from Firestore first
    const userRef = doc(db, 'users', auth.currentUser.uid)
    await deleteDoc(userRef)

    // Then delete Auth account
    await deleteUser(auth.currentUser)

    toast.success('Account deleted successfully')
    return true
  } catch (error) {
    console.error('Error deleting account:', error)
    if (error.code === 'auth/invalid-credential') {
      toast.error('Incorrect password')
    } else {
      toast.error('Failed to delete account')
    }
    return false
  }
}
