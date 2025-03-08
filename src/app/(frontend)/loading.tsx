import Spinner from '@/components/ui/spinner'

export default function Loading() {
  return (
    <div className="fixed h-screen inset-0 flex items-center justify-center bg-white z-10">
      <Spinner />
    </div>
  )
}
