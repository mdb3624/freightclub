import type { PaymentStatus } from '../api'

interface Props {
  status: PaymentStatus | null | undefined
}

const STATUS_LABEL: Record<PaymentStatus['status'], string> = {
  PENDING: 'Pending',
  PAID: 'Paid',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
}

export function PaymentStatusCard({ status }: Props) {
  if (!status) return null

  const payout = (status.truckerPayoutCents / 100).toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
  })

  return (
    <div data-testid="payment-status-card" className="rounded-xl border border-gray-200 bg-white p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Payment Status</h3>
      <p className="mt-2 text-lg font-semibold text-gray-900">{STATUS_LABEL[status.status]}</p>
      <p className="text-sm text-gray-600">Payout: {payout}</p>
      {status.paidAt && (
        <p className="text-sm text-gray-600">Paid on {new Date(status.paidAt).toLocaleDateString()}</p>
      )}
    </div>
  )
}
