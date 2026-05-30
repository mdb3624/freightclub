import { useRemovePreferredCarrier } from '../hooks/usePreferredCarriers'
import { Button } from '@/components/ui/Button'
import axios from 'axios'

interface ConfirmRemovalDialogProps {
  carrierId: string
  carrierName: string
  onConfirm: () => void
  onCancel: () => void
}

// AC-707-3: Shipper can remove carrier from preferred list
export function ConfirmRemovalDialog({
  carrierId,
  carrierName,
  onConfirm,
  onCancel,
}: ConfirmRemovalDialogProps) {
  const { mutate: removeCarrier, isPending, error } = useRemovePreferredCarrier()

  const handleConfirm = () => {
    removeCarrier(carrierId, {
      onSuccess: () => {
        onConfirm()
      },
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Remove carrier from preferred list?
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-3">
          <p className="text-sm text-gray-600">
            {carrierName} will no longer have priority access to your loads.
          </p>

          {error && (
            <div className="p-3 bg-red-50 rounded text-sm text-red-600">
              {axios.isAxiosError(error)
                ? error.response?.data?.message || 'Failed to remove carrier'
                : 'Failed to remove carrier'}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md border border-gray-300 disabled:opacity-50"
          >
            Cancel
          </button>
          <Button
            onClick={handleConfirm}
            isLoading={isPending}
            variant="destructive"
            className="flex-1"
          >
            Remove
          </Button>
        </div>
      </div>
    </div>
  )
}
