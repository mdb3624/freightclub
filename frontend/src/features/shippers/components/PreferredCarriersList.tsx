import { useState } from 'react'
import { usePreferredCarriers } from '../hooks/usePreferredCarriers'
import { AddCarrierModal } from './AddCarrierModal'
import { ConfirmRemovalDialog } from './ConfirmRemovalDialog'
import { Button } from '@/components/ui/Button'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import { AppShell } from '@/components/AppShell'

// AC-707-2: Shipper can view preferred carriers list
export function PreferredCarriersList() {
  const [page, setPage] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const [removeCarrierId, setRemoveCarrierId] = useState<string | null>(null)
  const [removeCarrierName, setRemoveCarrierName] = useState<string | null>(null)

  const { data, isLoading, error } = usePreferredCarriers(page, 20)

  const handleAddSuccess = () => {
    setShowAddModal(false)
    setPage(1) // Reset to page 1 after adding
  }

  const handleRemoveClick = (carrierId: string, carrierName: string) => {
    setRemoveCarrierId(carrierId)
    setRemoveCarrierName(carrierName)
  }

  const handleRemoveCancel = () => {
    setRemoveCarrierId(null)
    setRemoveCarrierName(null)
  }

  if (error) {
    return <AppShell><ErrorBanner message="Failed to load preferred carriers" /></AppShell>
  }

  const carriers = data?.data || []
  const pagination = data?.pagination
  const totalPages = pagination ? Math.ceil(pagination.total / pagination.limit) : 0

  return (
    <AppShell>
    <div data-testid="preferred-carriers-page" className="space-y-6">
      {/* Header */}
      <div data-testid="carrier-list-header" className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Preferred Carriers</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage carriers who can access your loads
        </p>
      </div>

      {/* Add Carrier Button */}
      <div className="flex justify-end">
        <Button data-testid="add-carrier-btn" onClick={() => setShowAddModal(true)}>
          + Add Carrier
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" />
        </div>
      )}

      {/* Empty State - AC-707-2 */}
      {!isLoading && carriers.length === 0 && (
        <div data-testid="empty-carriers-message" className="text-center py-12">
          <div className="text-4xl mb-2">📭</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Preferred Carriers Yet
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Build your preferred network to control load distribution and negotiate better rates
          </p>
          <Button onClick={() => setShowAddModal(true)}>
            + Add Your First Carrier
          </Button>
        </div>
      )}

      {/* Carriers Table - AC-707-2 */}
      {!isLoading && carriers.length > 0 && (
        <>
          <div data-testid="carrier-list-container" className="rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Carrier Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Date Added
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {carriers.map((carrier) => (
                  <tr key={carrier.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {carrier.carrierName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {carrier.carrierEmail || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(carrier.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        data-testid="remove-carrier-btn"
                        onClick={() => handleRemoveClick(carrier.carrierId, carrier.carrierName)}
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-2 text-sm font-medium rounded ${
                    page === p
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <AddCarrierModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />

      {removeCarrierId && removeCarrierName && (
        <ConfirmRemovalDialog
          carrierName={removeCarrierName}
          carrierId={removeCarrierId}
          onConfirm={() => {
            setRemoveCarrierId(null)
            setRemoveCarrierName(null)
          }}
          onCancel={handleRemoveCancel}
        />
      )}
    </div>
    </AppShell>
  )
}
