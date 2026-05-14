interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`animate-pulse rounded bg-gray-200 ${className}`} />
}

function cellWidth(j: number, cols: number): string {
  if (j === 0) return 'w-28'
  if (j === cols - 1) return 'w-12'
  return 'w-20'
}

export function TableSkeleton({
  rows = 5,
  cols = 6,
}: {
  rows?: number
  cols?: number
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="px-4 py-3">
                <Skeleton className="h-3 w-16" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>
              {Array.from({ length: cols }).map((_, j) => (
                <td key={j} className="px-4 py-3">
                  <Skeleton className={`h-4 ${cellWidth(j, cols)}`} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
