import { useState } from 'react'

interface Props {
  value: number        // 0 = none selected
  onChange?: (stars: number) => void
  size?: 'sm' | 'md' | 'lg'
  readOnly?: boolean
}

const SIZE = { sm: 'text-base', md: 'text-xl', lg: 'text-2xl' }

export function StarRating({ value, onChange, size = 'md', readOnly = false }: Props) {
  const [hover, setHover] = useState(0)
  const active = hover || value

  return (
    <div className="flex gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          className={[
            SIZE[size],
            'leading-none transition-colors',
            readOnly ? 'cursor-default' : 'cursor-pointer',
            n <= active ? 'text-amber-400' : 'text-gray-300',
          ].join(' ')}
          onMouseEnter={() => !readOnly && setHover(n)}
          onMouseLeave={() => !readOnly && setHover(0)}
          onClick={() => onChange?.(n)}
          aria-label={`${n} star${n !== 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}
