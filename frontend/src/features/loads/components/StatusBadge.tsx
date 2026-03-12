import type { LoadStatus } from '../types'

const colorMap: Record<LoadStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  OPEN: 'bg-blue-100 text-blue-700',
  CLAIMED: 'bg-amber-100 text-amber-700',
  IN_TRANSIT: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  SETTLED: 'bg-teal-100 text-teal-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

interface StatusBadgeProps {
  status: LoadStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${colorMap[status]}`}>
      {status.replace('_', ' ')}
    </span>
  )
}
