import { useSearchModal } from '@/contexts/SearchContext'
import { FiSearch } from 'react-icons/fi'

export function SearchButton() {
  const { openModal } = useSearchModal()
  return (
    <button onClick={openModal} className="bg-gray-100 rounded-full p-2" aria-label="Search">
      <FiSearch className="w-4 h-4" />
      <span className="sr-only">Search</span>
    </button>
  )
}
