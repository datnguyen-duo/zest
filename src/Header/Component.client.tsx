'use client'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { usePopup } from '@/contexts/PopupContext'
import { signOut } from 'firebase/auth'
import { FaUser } from 'react-icons/fa'
import { FaChevronDown } from 'react-icons/fa'
import type { Header } from '@/payload-types'
import Logo from '@/components/Logo/Logo'
import { toast } from 'react-hot-toast'
import Sidebar from '@/components/UserDashboard/Sidebar'
import { HeaderNav } from './Nav'
import { auth } from '@/firebase.config'
import { SearchButton } from '@/components/Search/SearchButton'
import { SearchModal } from '@/components/Search/SearchModal'
interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const { setIsLoginPopupOpen, setLoginMessage } = usePopup()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [dropdownState, setDropdownState] = useState<'closed' | 'active'>('closed')

  useEffect(() => {
    setDropdownState('closed')
  }, [pathname])

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('user-dropdown')
      const trigger = document.getElementById('dropdown-trigger')

      if (
        dropdown &&
        trigger &&
        !dropdown.contains(event.target as Node) &&
        !trigger.contains(event.target as Node)
      ) {
        setDropdownState('closed')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSettingsClick = () => {
    setDropdownState('closed')
    setIsSidebarOpen(true)
  }

  const toggleDropdown = () => {
    setDropdownState((current) => (current === 'closed' ? 'active' : 'closed'))
  }

  const handleLogin = () => {
    setLoginMessage('Login')
    setIsLoginPopupOpen(true)
  }

  const handleLogout = async () => {
    await signOut(auth)

    if (pathname.includes('/dashboard')) {
      router.push('/')
    } else {
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    }
    toast.success('Logged out successfully. Redirecting...')
  }

  return (
    <header className="z-40 fixed bg-white top-0 left-0 w-full">
      <div className="py-2 flex justify-between container">
        <Link href="/">
          <Logo className="w-20" color="var(--color-secondary)" />
        </Link>
        <HeaderNav data={data} />
        <div className="flex items-center gap-2">
          <SearchButton />
          <SearchModal />
          {isLoggedIn ? (
            <div
              className={`flex items-center gap-1 border border-black rounded-full p-1 relative transition-all duration-200 ${
                dropdownState === 'active' ? 'bg-black' : ''
              }`}
            >
              <Link href="/dashboard">
                <FaUser
                  className={`w-6 h-6 p-1 border border-black rounded-full cursor-pointer transition-all duration-200 ${
                    dropdownState === 'active' ? 'bg-white text-red' : 'bg-black text-white'
                  }`}
                />
              </Link>
              <button id="dropdown-trigger" onClick={toggleDropdown} className="focus:outline-none">
                <FaChevronDown
                  className={`w-5 h-5 p-1 cursor-pointer transition-all duration-200 ${
                    dropdownState === 'active' ? 'rotate-180 text-white' : ''
                  }`}
                />
              </button>
              <ul
                id="user-dropdown"
                className={`absolute top-[110%] right-0 bg-white rounded-lg shadow-lg z-50 overflow-hidden w-[200px] flex flex-col transition-opacity duration-300 ${
                  dropdownState === 'active'
                    ? 'opacity-100 pointer-events-auto'
                    : 'opacity-0 pointer-events-none'
                }`}
              >
                <li>
                  <Link
                    href="/dashboard"
                    className="flex py-2 px-4 hover:bg-gray-100 transition-colors w-full leading-none"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/collections"
                    className="flex py-2 px-4 hover:bg-gray-100 transition-colors w-full leading-none"
                  >
                    Collections
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/ratings"
                    className="flex py-2 px-4 hover:bg-gray-100 transition-colors w-full leading-none"
                  >
                    Ratings
                  </Link>
                </li>
                <li
                  onClick={handleSettingsClick}
                  className="cursor-pointer py-2 px-4 hover:bg-gray-100 transition-colors w-full leading-none"
                >
                  Settings
                </li>
                <li
                  onClick={handleLogout}
                  className="cursor-pointer py-2 px-4 hover:bg-gray-100 transition-colors w-full leading-none"
                >
                  Logout
                </li>
              </ul>
            </div>
          ) : (
            <button onClick={handleLogin}>
              <FaUser className="w-6 h-6 border border-black rounded-full p-1 cursor-pointer" />
            </button>
          )}
        </div>
      </div>

      {isSidebarOpen && <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />}
    </header>
  )
}
