import { useState } from 'react'
import { StarRating } from './StarRating'
import { Button } from '@/components/ui/Button'
import type { Rating } from '../types'
import { usePersonaTheme } from '@/contexts/PersonaThemeContext'

interface Props {
  loadId: string
  target: 'SHIPPER' | 'TRUCKER'
  targetName: string
  existingRating?: Rating | null
  onSubmit: (stars: number, comment?: string) => void
  isPending?: boolean
}

export function RatingForm({
  target,
  targetName,
  existingRating,
  onSubmit,
  isPending,
}: Props) {
  const [stars, setStars] = useState(existingRating?.stars ?? 0)
  const [comment, setComment] = useState(existingRating?.comment ?? '')
  const label = target === 'SHIPPER' ? 'Rate this Shipper' : 'Rate this Trucker'
  const { persona, surfaceClassName, textClassName, mutedClassName } = usePersonaTheme()
  const isCarrier = persona === 'carrier'
  const containerClass = isCarrier ? `${surfaceClassName} p-6 mt-4` : 'rounded-xl border border-gray-200 bg-white p-6 mt-4'

  if (existingRating) {
    return (
      <div className={containerClass}>
        <p className={`text-sm font-semibold ${isCarrier ? textClassName : 'text-gray-700'} mb-2`}>{label}</p>
        <div className="flex items-center gap-3">
          <StarRating value={existingRating.stars} readOnly size="md" />
          <span className={`text-sm ${mutedClassName}`}>Your rating for {targetName}</span>
        </div>
        {existingRating.comment && (
          <p className={`mt-2 text-sm ${mutedClassName} italic`}>"{existingRating.comment}"</p>
        )}
        <p className={`mt-2 text-xs ${mutedClassName}`}>
          Submitted {new Date(existingRating.createdAt).toLocaleDateString()}
        </p>
      </div>
    )
  }

  return (
    <div className={containerClass}>
      <p className={`text-sm font-semibold ${isCarrier ? textClassName : 'text-gray-700'} mb-3`}>{label}</p>
      <p className={`text-xs ${mutedClassName} mb-3`}>How was your experience with {targetName}?</p>

      <div className="space-y-4">
        <div>
          <StarRating value={stars} onChange={setStars} size="lg" />
          {stars > 0 && (
            <p className={`mt-1 text-xs ${mutedClassName}`}>
              {['', 'Poor', 'Below average', 'Average', 'Good', 'Excellent'][stars]}
            </p>
          )}
        </div>

        <div>
          <label className={`block text-sm font-medium ${isCarrier ? textClassName : 'text-gray-700'} mb-1`}>
            Comment <span className={mutedClassName}>(optional)</span>
          </label>
          <textarea
            className={isCarrier
              ? 'w-full rounded-lg border border-carrier-border bg-carrier-bg text-carrier-text px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-carrier-accent'
              : 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500'}
            rows={3}
            maxLength={1000}
            placeholder="Share details about your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <Button
          onClick={() => onSubmit(stars, comment || undefined)}
          isLoading={isPending}
          disabled={stars === 0}
        >
          Submit Rating
        </Button>
      </div>
    </div>
  )
}
