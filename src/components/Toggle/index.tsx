'use client'

interface ToggleProps {
  isEnabled: boolean
  onToggle: () => void
  label?: string
  disabled?: boolean
}

export default function Toggle({ isEnabled, onToggle, label, disabled = false }: ToggleProps) {
  return (
    <div className="flex items-center justify-between">
      {label && <span className="text-sm text-gray-700">{label}</span>}
      <button
        role="switch"
        aria-checked={isEnabled}
        aria-label={label}
        disabled={disabled}
        onClick={onToggle}
        className={`
          relative inline-flex h-8 w-16 items-center rounded-full
          transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2
          ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          ${isEnabled ? 'bg-black' : 'bg-gray-200'}
        `}
      >
        <span
          className={`
            inline-block h-6 w-6 rounded-full bg-white
            transform transition-transform duration-200 ease-in-out
            ${isEnabled ? 'translate-x-9' : 'translate-x-1'}
          `}
        />
      </button>
    </div>
  )
}
