interface Props {
  avgStars: number | null
  totalRatings: number
}

export function ShipperRepBadge({ avgStars, totalRatings }: Props) {
  if (!avgStars || totalRatings === 0) {
    return <span className="text-xs text-gray-400">New</span>
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
      <span className="text-amber-400">★</span>
      {avgStars.toFixed(1)}
      <span className="text-gray-400 font-normal">({totalRatings})</span>
    </span>
  )
}
