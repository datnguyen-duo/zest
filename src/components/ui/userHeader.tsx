import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { UserPhoto } from './userPhoto'
import { UserPhotoSkeleton } from './userPhoto'
import { useAuth } from '@/hooks/useAuth'

export function UserHeader() {
  const pathname = usePathname()
  const { user, isLoading: isAuthLoading } = useAuth()

  if (isAuthLoading) return <UserHeaderSkeleton />
  if (!user) return null

  const navItems = [
    { href: '/dashboard', label: 'Likes' },
    { href: '/dashboard/collections', label: 'Collections' },
    { href: '/dashboard/ratings', label: 'Ratings' },
  ]

  return (
    <div className="relative z-20 mb-10">
      <UserPhoto photoURL={user.photoURL} displayName={user.displayName} />
      <h1 className="text-h3 font-bold my-8 text-center">Hi {user.displayName} 👋</h1>

      <nav className="flex justify-center max-w-lg mx-auto">
        <ul className="grid grid-flow-col auto-cols-fr gap-2 items-center w-full">
          {navItems.map(({ href, label }) => {
            const isActive = pathname === href

            return (
              <li key={href} className="flex-1">
                {isActive ? (
                  <div className="text-center py-2 px-4 rounded-full bg-black text-white border border-black">
                    {label}
                  </div>
                ) : (
                  <Link
                    href={href}
                    className="block text-center py-2 px-4 rounded-full text-black border border-black hover:bg-black hover:text-white"
                  >
                    {label}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}

export function UserHeaderSkeleton() {
  return (
    <div className="relative z-20 mb-10 flex flex-col items-center">
      <UserPhotoSkeleton />
      <div className="text-2xl font-bold mb-4 mt-6 text-center">
        <div className="w-40 h-4 bg-gray-200 rounded-full" />
      </div>
      <nav className="flex justify-center max-w-lg mx-auto">
        <ul className="grid grid-flow-col auto-cols-fr gap-2 items-center w-full">
          <li className="flex-1">
            <div className="w-20 h-4 bg-gray-200 rounded-full" />
          </li>
          <li className="flex-1">
            <div className="w-20 h-4 bg-gray-200 rounded-full" />
          </li>
          <li className="flex-1">
            <div className="w-20 h-4 bg-gray-200 rounded-full" />
          </li>
        </ul>
      </nav>
    </div>
  )
}
