import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface CancelLoadModalProps {
  loadId: string
  onConfirm: (reason: string) => void
  onCancel: () => void
  isLoading: boolean
}

const CANCEL_REASONS = [
  { value: 'shipper_no_longer_needed', label: 'Load no longer needed' },
  { value: 'preferred_carrier', label: 'Using a preferred carrier' },
  { value: 'customer_request', label: 'Customer request / change' },
  { value: 'schedule_change', label: 'Schedule change' },
  { value: 'other', label: 'Other' },
]

export function CancelLoadModal({ onConfirm, onCancel, isLoading }: CancelLoadModalProps) {
  const [selected, setSelected] = useState('')
  const [custom, setCustom] = useState('')

  const reason = selected === 'other' ? custom.trim() : CANCEL_REASONS.find(r => r.value === selected)?.label ?? ''
  const canSubmit = reason.length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Cancel Load</h2>
          <p className="text-sm text-gray-500 mt-1">
            Please provide a reason. If a trucker has claimed this load, they will be notified.
          </p>
        </div>

        <div className="space-y-2">
          {CANCEL_REASONS.map((r) => (
            <label key={r.value} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="cancel_reason"
                value={r.value}
                checked={selected === r.value}
                onChange={() => setSelected(r.value)}
                className="accent-primary-600"
              />
              <span className="text-sm text-gray-800 group-hover:text-gray-900">{r.label}</span>
            </label>
          ))}
        </div>

        {selected === 'other' && (
          <textarea
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Describe the reason…"
            maxLength={500}
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
            Keep Load
          </Button>
          <Button
            variant="danger"
            onClick={() => onConfirm(reason)}
            disabled={!canSubmit || isLoading}
          >
            {isLoading ? 'Cancelling…' : 'Confirm Cancel'}
          </Button>
        </div>
      </div>
    </div>
  )
}
