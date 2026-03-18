import { useNavigate } from 'react-router-dom'
import type { LoadSummary } from '../types'
import { PAYMENT_TERMS_LABELS } from '../types'

interface LoadBoardTableProps {
  loads: LoadSummary[]
}

export function LoadBoardTable({ loads }: LoadBoardTableProps) {
  const navigate = useNavigate()

  if (loads.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
        <p className="text-gray-400 text-sm">No open loads right now. Check back soon.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {['Route', 'Distance', 'Pickup', 'Equipment', 'Pay', 'Terms', ''].map((h) => (
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
          {loads.map((load) => {
            const estimatedTotal =
              load.payRateType === 'PER_MILE' && load.distanceMiles != null
                ? load.payRate * load.distanceMiles
                : null

            return (
              <tr
                key={load.id}
                className="hover:bg-primary-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/trucker/loads/${load.id}`)}
              >
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-900">{load.origin}</p>
                  <p className="text-xs text-gray-500 mt-0.5">→ {load.destination}</p>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {load.distanceMiles != null
                    ? `${load.distanceMiles.toLocaleString()} mi`
                    : '—'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(load.pickupFrom).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {load.equipmentType.replace(/_/g, ' ')}
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm font-semibold text-gray-900">
                    ${load.payRate.toLocaleString()}
                    <span className="text-xs font-normal text-gray-500 ml-0.5">
                      {load.payRateType === 'PER_MILE' ? '/mi' : ' flat'}
                    </span>
                  </p>
                  {estimatedTotal != null && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      ≈ $
                      {estimatedTotal.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}{' '}
                      est.
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {load.paymentTerms
                    ? PAYMENT_TERMS_LABELS[load.paymentTerms]
                    : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className="text-primary-600 font-medium">View →</span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
