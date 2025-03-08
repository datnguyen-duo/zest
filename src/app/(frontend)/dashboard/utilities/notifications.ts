import { db } from '@/firebase.config'
import { doc, updateDoc, getDoc } from 'firebase/firestore'

interface NotificationSettings {
  newsletters: boolean
}

export async function updateNotificationSettings(
  userId: string,
  settings: Partial<NotificationSettings>,
) {
  try {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      notificationSettings: {
        ...(await getDoc(userRef)).data()?.notificationSettings,
        ...settings,
      },
    })
    return true
  } catch (error) {
    console.error('Error updating notification settings:', error)
    throw error
  }
}

export async function getNotificationSettings(userId: string): Promise<NotificationSettings> {
  const userRef = doc(db, 'users', userId)
  const userDoc = await getDoc(userRef)
  return userDoc.data()?.notificationSettings || { newsletters: false }
}
