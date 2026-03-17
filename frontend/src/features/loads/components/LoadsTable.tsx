import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { LoadSummary } from '../types'
import { StatusBadge } from './StatusBadge'

interface LoadsTableProps {
  loads: LoadSummary[]
  onCancel: (id: string) => void
  isCancelling: boolean
}

const editableStatuses = new Set(['DRAFT', 'OPEN'])
const cancellableStatuses = new Set(['DRAFT', 'OPEN', 'CLAIMED'])

export function LoadsTable({ loads, onCancel, isCancelling }: LoadsTableProps) {
  const navigate = useNavigate()
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  if (loads.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-400">
        No loads yet. Post your first load to get started.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {['Origin', 'Destination', 'Distance', 'Pickup', 'Equipment', 'Pay Rate', 'Status', 'Actions'].map((h) => (
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
            const canEdit = editableStatuses.has(load.status)
            const canCancel = cancellableStatuses.has(load.status)
            return (
              <tr
                key={load.id}
                className="hover:bg-primary-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/shipper/loads/${load.id}`)}
              >
                <td className="px-4 py-3 text-sm text-gray-900">{load.origin}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{load.destination}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {load.distanceMiles != null ? `${load.distanceMiles.toLocaleString()} mi` : '—'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(load.pickupFrom).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {load.equipmentType.replace('_', ' ')}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  ${load.payRate.toLocaleString()}
                  <span className="text-xs font-normal text-gray-500 ml-0.5">
                    {load.payRateType === 'PER_MILE' ? '/mi' : ' flat'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={load.status} />
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  {confirmingId === load.id ? (
                    <span className="flex items-center gap-2 text-sm">
                      <span className="text-gray-700">Confirm?</span>
                      <button
                        className="text-red-600 hover:underline font-medium"
                        onClick={() => {
                          onCancel(load.id)
                          setConfirmingId(null)
                        }}
                        disabled={isCancelling}
                      >
                        Yes
                      </button>
                      <button
                        className="text-gray-500 hover:underline"
                        onClick={() => setConfirmingId(null)}
                      >
                        No
                      </button>
                    </span>
                  ) : (
                    <span className="flex items-center gap-3 text-sm">
                      {canEdit && (
                        <Link
                          to={`/shipper/loads/${load.id}/edit`}
                          className="text-primary-600 hover:underline font-medium"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Edit
                        </Link>
                      )}
                      {canCancel && (
                        <button
                          className="text-red-600 hover:underline font-medium"
                          onClick={() => setConfirmingId(load.id)}
                        >
                          Cancel
                        </button>
                      )}
                    </span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
