import { useNavigate } from 'react-router-dom'
import { EarningSummaryCard } from './EarningSummaryCard'
import { StatusBadge } from './StatusBadge'
import { Button } from '@/components/ui/Button'
import type { LoadSummary, Page } from '@/features/loads/types'

interface Props {
  history: Page<LoadSummary> | undefined
  setHistoryPage: React.Dispatch<React.SetStateAction<number>>
}

export function LoadHistoryTab({ history, setHistoryPage }: Props) {
  const navigate = useNavigate()

  return (
    <section>
      <h2 className="sr-only">History</h2>
      {history && history.content.length > 0 && (
        <EarningSummaryCard loads={history.content} />
      )}
      {!history || history.totalElements === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="text-gray-400 text-sm">No past loads yet.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Route', 'Distance', 'Pay', 'Status', 'Pickup', 'Delivery'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.content.map((load) => {
                  const isCancelled = load.status === 'CANCELLED'
                  const total =
                    !isCancelled && load.payRateType === 'PER_MILE' && load.distanceMiles != null
                      ? load.payRate * load.distanceMiles
                      : null
                  return (
                    <tr
                      key={load.id}
                      className="hover:bg-primary-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/trucker/loads/${load.id}`)}
                    >
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-900">{load.origin}</p>
                        <p className="text-xs text-gray-500 mt-0.5">→ {load.destination}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {load.distanceMiles != null
                          ? `${load.distanceMiles.toLocaleString()} mi`
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {isCancelled ? (
                          <span className="text-sm text-gray-400">—</span>
                        ) : (
                          <>
                            <p className="text-sm font-medium text-gray-900">
                              ${load.payRate.toLocaleString()}
                              <span className="text-xs font-normal text-gray-500 ml-0.5">
                                {load.payRateType === 'PER_MILE' ? '/mi' : ' flat'}
                              </span>
                            </p>
                            {total != null && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                ≈ ${total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                              </p>
                            )}
                          </>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={load.status} />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {isCancelled ? '—' : new Date(load.pickupFrom).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {isCancelled ? '—' : new Date(load.deliveryTo).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {history.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <span>
                Page {history.number + 1} of {history.totalPages} ({history.totalElements} loads)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setHistoryPage((p) => p - 1)}
                  disabled={history.number === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setHistoryPage((p) => p + 1)}
                  disabled={history.number >= history.totalPages - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  )
}
