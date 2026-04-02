import type { Load } from '../types'
import { PAYMENT_TERMS_LABELS } from '../types'
import { StatusBadge } from './StatusBadge'
import { useLoadEvents } from '../hooks/useLoadEvents'

interface LoadDetailProps {
  load: Load
}

function formatDateTime(dt: string) {
  return new Date(dt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString(undefined, { dateStyle: 'medium' })
}

function formatDimension(decimalFt: number): string {
  const totalIn = Math.round(decimalFt * 12)
  const ft = Math.floor(totalIn / 12)
  const inches = totalIn % 12
  return inches === 0 ? `${ft} ft` : `${ft} ft ${inches} in`
}

const EVENT_LABELS: Record<string, string> = {
  CREATED: 'Load created',
  PUBLISHED: 'Published to load board',
  CLAIMED: 'Claimed by trucker',
  PICKED_UP: 'Picked up',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  SETTLED: 'Settled',
}

function LoadTimeline({ loadId }: { loadId: string }) {
  const { data: events, isLoading } = useLoadEvents(loadId)

  if (isLoading) return <p className="text-sm text-gray-400">Loading timeline…</p>
  if (!events || events.length === 0) return null

  return (
    <section>
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Status Timeline</h3>
      <ol className="relative border-l border-gray-200 space-y-4 ml-3">
        {events.map((event) => (
          <li key={event.id} className="ml-4">
            <div className="absolute -left-1.5 w-3 h-3 rounded-full bg-primary-500 border-2 border-white" />
            <p className="text-sm font-medium text-gray-900">
              {EVENT_LABELS[event.eventType] ?? event.eventType}
            </p>
            {event.note && (
              <p className="text-xs text-gray-500 mt-0.5">{event.note}</p>
            )}
            <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(event.createdAt)}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

export function LoadDetail({ load }: LoadDetailProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 font-mono">ID: {load.id}</p>
          <p className="text-xs text-gray-400 mt-0.5">Posted {formatDate(load.createdAt)}</p>
        </div>
        <StatusBadge status={load.status} />
      </div>

      <section>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Route</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs font-medium text-gray-500 mb-1">Origin</p>
            <p className="font-semibold text-gray-900">{load.originCity}, {load.originState} {load.originZip}</p>
            <p className="text-sm text-gray-600 mt-0.5">{load.originAddress1}</p>
            {load.originAddress2 && (
              <p className="text-sm text-gray-600">{load.originAddress2}</p>
            )}
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs font-medium text-gray-500 mb-1">Destination</p>
            <p className="font-semibold text-gray-900">{load.destinationCity}, {load.destinationState} {load.destinationZip}</p>
            <p className="text-sm text-gray-600 mt-0.5">{load.destinationAddress1}</p>
            {load.destinationAddress2 && (
              <p className="text-sm text-gray-600">{load.destinationAddress2}</p>
            )}
          </div>
        </div>
        {load.distanceMiles != null && (
          <p className="mt-2 text-sm text-gray-500">
            Estimated distance: <span className="font-medium text-gray-700">{load.distanceMiles.toLocaleString()} mi</span>
          </p>
        )}
      </section>

      <section>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Schedule</h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-sm text-gray-700">
          <div>
            <span className="font-medium">Pickup window: </span>
            {formatDateTime(load.pickupFrom)} – {formatDateTime(load.pickupTo)}
          </div>
          <div>
            <span className="font-medium">Delivery window: </span>
            {formatDateTime(load.deliveryFrom)} – {formatDateTime(load.deliveryTo)}
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Cargo</h3>
        <dl className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <dt className="text-gray-500">Commodity</dt>
            <dd className="font-medium text-gray-900">{load.commodity}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Weight</dt>
            <dd className="font-medium text-gray-900">{load.weightLbs.toLocaleString()} lbs</dd>
          </div>
          <div>
            <dt className="text-gray-500">Equipment</dt>
            <dd className="font-medium text-gray-900">{load.equipmentType.replace('_', ' ')}</dd>
          </div>
          {(load.lengthFt != null || load.widthFt != null || load.heightFt != null) && (
            <div className="col-span-3">
              <dt className="text-gray-500">Dimensions (L × W × H)</dt>
              <dd className="font-medium text-gray-900">
                {load.lengthFt != null ? formatDimension(load.lengthFt) : '—'}{' × '}
                {load.widthFt != null ? formatDimension(load.widthFt) : '—'}{' × '}
                {load.heightFt != null ? formatDimension(load.heightFt) : '—'}
              </dd>
            </div>
          )}
        </dl>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Rate</h3>
        <p className="text-2xl font-bold text-gray-900">
          ${load.payRate.toLocaleString()}
          <span className="text-base font-normal text-gray-500 ml-1">
            {load.payRateType === 'PER_MILE' ? '/mi' : 'flat'}
          </span>
        </p>
        {load.payRateType === 'PER_MILE' && load.distanceMiles != null && (
          <p className="text-sm text-gray-500 mt-1">
            ≈ ${(load.payRate * load.distanceMiles).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} estimated total
          </p>
        )}
        {load.paymentTerms && (
          <p className="text-sm text-gray-600 mt-2">
            Payment terms:{' '}
            <span className="font-medium text-gray-900">
              {PAYMENT_TERMS_LABELS[load.paymentTerms]}
            </span>
          </p>
        )}
      </section>

      {load.specialRequirements && (
        <section>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Notes</h3>
          <p className="text-sm text-gray-700 whitespace-pre-line">{load.specialRequirements}</p>
        </section>
      )}

      {load.cancelReason && (
        <section className="rounded-lg bg-red-50 border border-red-100 px-4 py-3">
          <h3 className="text-sm font-semibold text-red-700 mb-1">Cancellation Reason</h3>
          <p className="text-sm text-red-600">{load.cancelReason}</p>
        </section>
      )}

      <LoadTimeline loadId={load.id} />
    </div>
  )
}
