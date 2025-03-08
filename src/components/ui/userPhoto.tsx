import Image from 'next/image'
interface UserProps {
  photoURL?: string | null
  displayName?: string | null
}

export function UserPhoto({ photoURL, displayName }: UserProps) {
  const getInitials = (name: string | null) => {
    if (!name) return ''
    const nameParts = name.trim().split(' ')
    if (nameParts.length === 1) {
      return name.substring(0, 2).toUpperCase()
    }
    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
  }

  return (
    <div className="flex items-center justify-center flex-col gap-4">
      <div className="relative">
        {photoURL ? (
          <Image
            src={photoURL}
            alt="Profile Image"
            className="w-20 h-20 rounded-full object-cover"
            width={80}
            height={80}
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-xl text-gray-500">{getInitials(displayName || '')}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export function UserPhotoSkeleton() {
  return <div className="w-20 h-20 rounded-full bg-gray-200" />
}
