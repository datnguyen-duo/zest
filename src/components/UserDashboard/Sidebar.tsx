import { useRef, useState } from 'react'
import { auth } from '@/firebase.config'
import { FiX } from 'react-icons/fi'
import {
  updateUserProfile,
  updateUserEmail,
  updateUserPassword,
  deleteUserAccount,
  getNotificationSettings,
  checkAndUpdateEmail,
} from '@/utilities/users'
import ConfirmPasswordDialog from './ConfirmPasswordDialog'
import Toggle from '@/components/Toggle'
import { useRouter } from 'next/navigation'
import { cn } from '@/utilities/cn'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const user = auth.currentUser
  const router = useRouter()
  const isAuth = auth.currentUser?.providerData[0].providerId !== 'password'
  const overlayRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [isUpdatingName, setIsUpdatingName] = useState(false)
  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [newEmail, setNewEmail] = useState(user?.email || '')
  const [newPassword, setNewPassword] = useState('••••••••')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [pendingAction, setPendingAction] = useState<'email' | 'password' | null>(null)

  const handleClose = () => {
    overlayRef.current?.classList.add('animate-fadeOut')
    sidebarRef.current?.classList.add('sidebar-exit')
    // Wait for animation to finish before closing
    setTimeout(() => {
      onClose()
    }, 300)
  }

  if (user) {
    checkAndUpdateEmail()
  }
  const [newsletters, setNewsletters] = useState(() => {
    if (!user) return false

    const getInitialState = async () => {
      const settings = await getNotificationSettings(user.uid)
      setNewsletters(settings.newsletters)
    }

    getInitialState()
    return false
  })

  const handleNameUpdate = async () => {
    if (!user || !displayName.trim() || isUpdatingName) return

    setIsUpdatingName(true)
    try {
      await updateUserProfile({ displayName: displayName.trim() })
    } finally {
      setIsUpdatingName(false)
      onClose()
      router.refresh()
    }
  }

  const handleEmailClick = () => {
    if (!newEmail.trim()) return
    setPendingAction('email')
    setShowPasswordConfirm(true)
  }

  const handlePasswordClick = () => {
    if (!newPassword.trim()) return
    setPendingAction('password')
    setShowPasswordConfirm(true)
  }

  const handleConfirmPassword = async (password: string) => {
    try {
      if (pendingAction === 'email') {
        await updateUserEmail(newEmail, password)
        setNewEmail('') // Clear after success
      } else if (pendingAction === 'password') {
        await updateUserPassword(password, newPassword)
        setNewPassword('') // Clear after success
        onClose()
        router.refresh()
      }
    } catch (error) {
      console.error('Error updating:', error)
    }
  }

  const handleNewsletterToggle = async () => {
    if (!user) return

    const success = await updateUserProfile({
      notificationSettings: {
        newsletters: !newsletters,
      },
    })

    if (success) {
      setNewsletters(!newsletters)
    }
  }

  const handleDeleteAccount = async (password: string) => {
    const success = await deleteUserAccount(password)
    try {
      if (success) {
        // Redirect to home or login page
        router.push('/')
      }
    } catch (error) {
      console.error('Error deleting account:', error)
    }
  }

  return (
    <>
      <div className="overlay" onClick={handleClose} ref={overlayRef}>
        <div
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'flex flex-col items-center pt-12 px-8 pb-8 border-r h-screen fixed top-0 right-0 w-[500px] bg-white z-10 shadow-lg',
            isOpen ? 'sidebar-enter' : 'sidebar-exit',
          )}
          ref={sidebarRef}
        >
          {/* Profile Section */}

          <h1 className="text-2xl font-bold mb-6">Account Settings</h1>

          <div className="w-full mb-8 border-b pb-8">
            <p className="mb-2">Profile Information</p>
            <div className="flex flex-col gap-6">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    id="name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full border-b py-2 peer pt-4 pb-2 focus:outline-none focus:border-black"
                  />
                  <label
                    htmlFor="name"
                    className="absolute text-gray-500 duration-300 transform -translate-y-5 scale-75 top-4 z-10 origin-[0] left-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-5"
                  >
                    Name
                  </label>
                </div>
                <button
                  onClick={handleNameUpdate}
                  disabled={
                    isUpdatingName || !displayName.trim() || displayName === user?.displayName
                  }
                  className={`px-4 py-2 rounded-md border transition-colors
              ${
                isUpdatingName || !displayName.trim() || displayName === user?.displayName
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-dark text-dark hover:bg-gray-800 hover:text-white'
              }`}
                >
                  {isUpdatingName ? '...' : 'Update'}
                </button>
              </div>
              {!isAuth && (
                <>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="email"
                        id="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="w-full border-b py-2 peer pt-4 pb-2 focus:outline-none focus:border-black"
                      />
                      <label
                        htmlFor="email"
                        className="absolute text-gray-500 duration-300 transform -translate-y-5 scale-75 top-4 z-10 origin-[0] left-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-5"
                      >
                        Email
                      </label>
                    </div>
                    <button
                      onClick={handleEmailClick}
                      disabled={!newEmail || newEmail === user?.email}
                      className={`px-4 py-2 rounded-md border transition-colors
                ${
                  !newEmail || newEmail === user?.email
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-dark text-dark hover:bg-gray-800 hover:text-white'
                }`}
                    >
                      Update
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="password"
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full border-b py-2 peer pt-4 pb-2 focus:outline-none focus:border-black"
                        placeholder=" "
                      />
                      <label
                        htmlFor="newPassword"
                        className="absolute text-gray-500 duration-300 transform -translate-y-5 scale-75 top-4 z-10 origin-[0] left-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-5"
                      >
                        Password
                      </label>
                    </div>
                    <button
                      onClick={handlePasswordClick}
                      disabled={!newPassword || newPassword === '••••••••'}
                      className={`px-4 py-2 rounded-md border transition-colors
                ${
                  !newPassword || newPassword === '••••••••'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-dark text-dark hover:bg-gray-800 hover:text-white'
                }`}
                    >
                      Update
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="w-full mb-8 border-b pb-8">
            <p className="mb-2">Notification Settings</p>
            <Toggle
              isEnabled={newsletters}
              onToggle={handleNewsletterToggle}
              label="Receive newsletters and promotional emails"
            />
          </div>

          <div className="w-full mt-auto">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full text-red-500 px-4 py-2 rounded-md border border-red-500 hover:bg-red-600 hover:text-white"
            >
              Delete Account
            </button>
          </div>

          <button className="absolute top-4 right-4 text-2xl text-dark" onClick={handleClose}>
            <FiX />
          </button>
        </div>
      </div>

      <ConfirmPasswordDialog
        isOpen={showPasswordConfirm}
        onClose={() => {
          setShowPasswordConfirm(false)
          setPendingAction(null)
        }}
        onConfirm={handleConfirmPassword}
        title={pendingAction === 'email' ? 'Confirm Email Change' : 'Confirm Password Change'}
        message="Please enter your current password to continue."
      />
      <ConfirmPasswordDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message="This action cannot be undone. Please enter your password to confirm."
        confirmButtonText="Delete Account"
        confirmButtonClass="bg-red-500 text-white hover:bg-red-600"
      />
    </>
  )
}
