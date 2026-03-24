import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useMyReceivedRatings, useMyRatingSummary } from '@/features/ratings/hooks/useRatings'
import { StarRating } from '@/features/ratings/components/StarRating'
import { AppShell } from '@/components/AppShell'

export function RatingsPage() {
  const user = useAuthStore((s) => s.user)
  const isTrucker = user?.role === 'TRUCKER'
  const dashboardPath = isTrucker ? '/dashboard/trucker' : '/dashboard/shipper'

  const { data: summary } = useMyRatingSummary()
  const { data: page, isLoading } = useMyReceivedRatings()

  return (
    <AppShell maxWidth="lg">
      <div className="mb-6">
        <Link to={dashboardPath} className="text-sm text-primary-600 hover:underline">
          ← Back to Dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900">My Ratings</h1>
      </div>

      {summary && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
            Overall Rating
          </h3>
          <div className="flex items-center gap-4">
            {summary.avgStars != null ? (
              <>
                <StarRating value={Math.round(summary.avgStars)} readOnly size="lg" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {summary.avgStars.toFixed(1)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {summary.totalRatings} rating{summary.totalRatings !== 1 ? 's' : ''}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-400">No ratings yet.</p>
            )}
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Based on {summary.completedLoads} completed load{summary.completedLoads !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Rating History
          </h3>
        </div>

        {isLoading && (
          <div className="p-6 space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && (!page || page.content.length === 0) && (
          <div className="p-12 text-center">
            <p className="text-sm text-gray-400">No ratings received yet.</p>
          </div>
        )}

        {page && page.content.length > 0 && (
          <ul className="divide-y divide-gray-100">
            {page.content.map((rating) => (
              <li key={rating.id} className="px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <StarRating value={rating.stars} readOnly size="sm" />
                    {rating.comment && (
                      <p className="mt-1 text-sm text-gray-700 italic">"{rating.comment}"</p>
                    )}
                    <p className="mt-1 text-xs text-gray-400">
                      {new Date(rating.createdAt).toLocaleDateString()}
                      {' · '}
                      <span className="capitalize">
                        {rating.reviewerRole === 'SHIPPER' ? 'Shipper' : 'Trucker'}
                      </span>
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  )
}
