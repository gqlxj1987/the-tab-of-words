import { CheckIcon } from '@heroicons/react/solid'

interface PickerProps {
  label: string
  picked: boolean
  disabled: boolean
  onClick: (picked: boolean) => void
}

export default function Picker({
  disabled,
  label,
  picked,
  onClick,
}: PickerProps) {
  return (
    <button
      className={`${
        picked ? 'bg-stone-600 text-white dark:bg-stone-300 dark:text-stone-900' : 'bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-300'
      } ${disabled ? 'cursor-not-allowed' : ''}
      flex select-none items-center rounded-full py-1 pl-2 pr-3 text-sm font-medium leading-none transition-colors`}
      onClick={() => !disabled && onClick(!picked)}
    >
      <div className="mr-2 flex h-4 w-4 items-center justify-center rounded-full border-stone-200 bg-white dark:border-stone-600 dark:bg-stone-800">
        <CheckIcon
          className={`${picked ? 'text-stone-600 dark:text-stone-300' : 'text-white dark:text-stone-800'} h-3 w-3`}
        />
      </div>
      {label}
    </button>
  )
}
