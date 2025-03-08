import { useRef, useState } from 'react'
import { auth, googleProvider, facebookProvider, db } from '@/firebase.config'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  updateProfile,
  User,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import { FaGoogle, FaFacebook } from 'react-icons/fa'
import { usePopup } from '@/contexts/PopupContext'
import { Input } from '@/components/ui/input'

import { Label } from '@/components/ui/label'
import { FiX, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi'
import { cn } from '@/utilities/cn'
import Spinner from '@/components/ui/spinner'

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'Firebase: Error (auth/popup-closed-by-user).': 'Sign in was cancelled',
  'Firebase: Error (auth/invalid-credential).': 'Invalid email or password',
  'Firebase: Error (auth/user-not-found).': 'No account found with this email',
  'Firebase: Error (auth/wrong-password).': 'Incorrect password',
  'Firebase: Error (auth/email-already-in-use).': 'An account already exists with this email',
  'Firebase: Error (auth/weak-password).': 'Password should be at least 6 characters',
  'Firebase: Error (auth/invalid-email).': 'Please enter a valid email address',
  'Firebase: Error (auth/network-request-failed).':
    'Connection error. Please check your internet connection',
  'Firebase: Error (auth/too-many-requests).': 'Too many attempts. Please try again later',
  'Firebase: Error (auth/popup-blocked).': 'Pop-up was blocked by your browser',
}

interface LoginPopupProps {
  isOpen: boolean
  onClose: () => void
}

// Save user to Firestore
const saveUserToFirestore = async (user: User) => {
  if (!user) return

  const userRef = doc(db, 'users', user.uid)
  const userSnap = await getDoc(userRef)

  if (!userSnap.exists()) {
    // Add user to Firestore
    await setDoc(userRef, {
      name: user.displayName || 'Anonymous',
      email: user.email,
      createdAt: serverTimestamp(),
    })
    console.log('User added to Firestore')
  } else {
    console.log('User already exists in Firestore')
  }
}

export default function LoginPopup({ onClose }: LoginPopupProps) {
  const { loginMessage } = usePopup()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('') // Full Name during registration
  const [isRegister, setIsRegister] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resetStatus, setResetStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const overlayRef = useRef<HTMLDivElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const [showPassword, setShowPassword] = useState(false)

  const handleClose = () => {
    popupRef.current?.classList.add('popup-exit')
    overlayRef.current?.classList.add('animate-fadeOut')
    setTimeout(() => {
      onClose()
    }, 300)
  }

  // Handle Email/Password Login or Registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      if (isRegister) {
        // Register user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        await updateProfile(userCredential.user, { displayName: fullName })

        // Save to Firestore
        await saveUserToFirestore(userCredential.user)
      } else {
        // Login user
        const userCredential = await signInWithEmailAndPassword(auth, email, password)

        // Save to Firestore
        await saveUserToFirestore(userCredential.user)
      }
      handleClose()
      router.push('/dashboard')
    } catch (error) {
      setError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Forgot Password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetStatus(null)
    setError(null)
    setIsSubmitting(true)
    try {
      await sendPasswordResetEmail(auth, email)
      // Only show success if the email was actually sent
      setResetStatus(
        'If an account exists with this email, you will receive a password reset link.',
      )
    } catch (error) {
      // Handle specific Firebase errors
      switch (error.code) {
        case 'auth/user-not-found':
          // Don't reveal if email exists or not (security best practice)
          setResetStatus(
            'If an account exists with this email, you will receive a password reset link.',
          )
          break
        case 'auth/invalid-email':
          setError('Please enter a valid email address.')
          break
        case 'auth/missing-email':
          setError('Please enter an email address.')
          break
        case 'auth/too-many-requests':
          setError('Too many attempts. Please try again later.')
          break
        default:
          setError('An error occurred. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Google Login
  const handleGoogleSignIn = async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider)

      // Save to Firestore
      await saveUserToFirestore(userCredential.user)
      handleClose()
      router.push('/dashboard')
    } catch (error) {
      setError(error.message || 'Google login failed.')
    }
  }

  // Facebook Login
  const handleFacebookSignIn = async () => {
    try {
      const userCredential = await signInWithPopup(auth, facebookProvider)
      await saveUserToFirestore(userCredential.user)
      handleClose()
      router.push('/dashboard')
    } catch (error) {
      setError(error.message || 'Facebook login failed.')
    }
  }

  const passwordChecks = {
    minLength: (pass: string) => pass.length >= 8,
    hasSymbolOrNumber: (pass: string) => /[0-9!@#$%^&*]/.test(pass),
  }

  const isPasswordValid = (pass: string) => {
    if (!isRegister) return true // Don't validate for login
    return Object.values(passwordChecks).every((check) => check(pass))
  }

  const getAuthErrorMessage = (errorCode: string) => {
    // return AUTH_ERROR_MESSAGES[errorCode] || 'An error occurred. Please try again.'
    return errorCode
  }

  return (
    <div ref={overlayRef} className="overlay" onClick={handleClose}>
      <div
        ref={popupRef}
        className="bg-white rounded-lg pb-6 pt-12 px-6 w-full max-w-md relative z-50 text-secondary popup-content popup-enter"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <FiX className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold mb-4 text-center">
          {isRegister ? 'Get Started' : showForgotPassword ? 'Reset Password' : loginMessage}
        </h1>

        {showForgotPassword ? (
          // Forgot Password Form
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <p className="text-sm text-gray-600 mb-2 text-center">
              Enter your email to reset your password.
            </p>
            <div className="relative">
              <Input
                type="email"
                id="forgotEmail"
                value={email}
                placeholder=""
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-b py-2 peer pt-4 pb-2 focus:outline-none focus:border-black"
                required
              />
              <label
                htmlFor="forgotEmail"
                className="absolute pointer-events-none text-gray-500 duration-300 transform -translate-y-5 scale-75 top-4 z-10 origin-[0] left-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-5"
              >
                Email
              </label>
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white p-2 rounded hover:bg-black/80 flex items-center justify-center"
            >
              {isSubmitting ? <Spinner /> : 'Send Reset Email'}
            </button>
            {resetStatus && <p className="text-green-500 text-sm">{resetStatus}</p>}
            <p
              className="text-sm text-blue-600 text-center mt-4 cursor-pointer hover:underline"
              onClick={() => setShowForgotPassword(false)}
            >
              Back to Login
            </p>
          </form>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div className="relative">
                  <Input
                    type="text"
                    id="fullName"
                    value={fullName}
                    placeholder=""
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full border-b py-2 peer pt-4 pb-2 focus:outline-none focus:border-black"
                    required
                  />
                  <label
                    htmlFor="fullName"
                    className="absolute pointer-events-none text-gray-500 duration-300 transform -translate-y-5 scale-75 top-4 z-10 origin-[0] left-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-5"
                  >
                    Full Name
                  </label>
                </div>
              )}
              <div className="relative">
                <Input
                  type="email"
                  id="email"
                  placeholder=""
                  className="w-full border-b py-2 peer pt-4 pb-2 focus:outline-none focus:border-black"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Label
                  htmlFor="email"
                  className="absolute pointer-events-none text-gray-500 duration-300 transform -translate-y-5 scale-75 top-4 z-10 origin-[0] left-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-5"
                >
                  Email
                </Label>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder=""
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  required
                />
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-4 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
                {isRegister && (
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        passwordChecks.minLength(password) ? 'opacity-100' : 'opacity-50',
                        'text-sm mt-2 flex items-center gap-2',
                      )}
                    >
                      <FiCheck className="w-5 h-5 border rounded-full p-1" />

                      <p>8+ Characters</p>
                    </div>

                    <div
                      className={cn(
                        passwordChecks.hasSymbolOrNumber(password) ? 'opacity-100' : 'opacity-50',
                        'text-sm mt-2 flex items-center gap-2',
                      )}
                    >
                      <FiCheck className="w-5 h-5 border rounded-full p-1" />
                      <p>1+ Number or Symbol</p>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white p-2 rounded hover:bg-black/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                disabled={!isPasswordValid(password)}
              >
                {isSubmitting ? <Spinner /> : isRegister ? 'Register' : 'Login'}
              </button>
            </form>

            {error && <p className="text-red-500 text-sm mt-4">{getAuthErrorMessage(error)}</p>}

            {/* OAuth Buttons */}
            <div className="mt-8 grid grid-cols-2 align-center gap-2">
              <p className="text-secondary mb-2 text-center col-span-2">Continue with</p>
              <button
                onClick={handleGoogleSignIn}
                className="relative w-full flex gap-2 items-center justify-center text-secondary border p-2 rounded hover:bg-black hover:text-white"
              >
                <FaGoogle className="w-5 h-5" />
                Google
              </button>
              <button
                onClick={handleFacebookSignIn}
                className="relative w-full flex gap-2 items-center justify-center text-secondary border p-2 rounded hover:bg-black hover:text-white"
              >
                <FaFacebook className="w-5 h-5" />
                Facebook
              </button>
            </div>
          </>
        )}

        {!showForgotPassword && !isRegister && (
          <p
            className="text-sm text-blue-600 text-center mt-4 cursor-pointer hover:underline"
            onClick={() => setShowForgotPassword(true)}
          >
            Forgot Password?
          </p>
        )}

        {!showForgotPassword && (
          <p
            onClick={() => {
              setIsRegister(!isRegister)
              setError(null)
            }}
            className="text-center mt-4 text-sm cursor-pointer text-blue-600 hover:underline"
          >
            {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
          </p>
        )}
      </div>
    </div>
  )
}
