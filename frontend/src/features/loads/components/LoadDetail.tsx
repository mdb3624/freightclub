import type { Load } from '../types'
import { PAYMENT_TERMS_LABELS } from '../types'
import { StatusBadge } from './StatusBadge'
import { useLoadEvents } from '../hooks/useLoadEvents'
import { usePersonaTheme } from '@/contexts/PersonaThemeContext'

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
  const { persona, textClassName, mutedClassName } = usePersonaTheme()
  const isCarrier = persona === 'carrier'

  if (isLoading) return <p className={`text-sm ${mutedClassName}`}>Loading timeline…</p>
  if (!events || events.length === 0) return null

  return (
    <section>
      <h3 className={`text-sm font-semibold ${mutedClassName} uppercase tracking-wide mb-3`}>Status Timeline</h3>
      <ol className={`relative border-l ${isCarrier ? 'border-carrier-border' : 'border-gray-200'} space-y-4 ml-3`}>
        {events.map((event) => (
          <li key={event.id} className="ml-4">
            <div className={`absolute -left-1.5 w-3 h-3 rounded-full ${isCarrier ? 'bg-carrier-accent border-2 border-carrier-bg' : 'bg-primary-500 border-2 border-white'}`} />
            <p className={`text-sm font-medium ${textClassName}`}>
              {EVENT_LABELS[event.eventType] ?? event.eventType}
            </p>
            {event.note && (
              <p className={`text-xs ${mutedClassName} mt-0.5`}>{event.note}</p>
            )}
            <p className={`text-xs ${mutedClassName} mt-0.5`}>{formatDateTime(event.createdAt)}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

export function LoadDetail({ load }: LoadDetailProps) {
  const { persona, textClassName, mutedClassName } = usePersonaTheme()
  const isCarrier = persona === 'carrier'
  const heading = `text-sm font-semibold ${mutedClassName} uppercase tracking-wide`
  const routeBoxClass = isCarrier ? 'rounded-lg bg-carrier-bg border border-carrier-border p-3' : 'rounded-lg bg-gray-50 p-3'

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-xs ${mutedClassName} font-mono`}>ID: {load.id}</p>
          <p className={`text-xs ${mutedClassName} mt-0.5`}>Posted {formatDate(load.createdAt)}</p>
        </div>
        <StatusBadge status={load.status} />
      </div>

      <section>
        <h3 className={`${heading} mb-3`}>Route</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className={routeBoxClass}>
            <p className={`text-xs font-medium ${mutedClassName} mb-1`}>Origin</p>
            <p className={`font-semibold ${textClassName}`}>{load.originCity}, {load.originState} {load.originZip}</p>
            <p className={`text-sm ${mutedClassName} mt-0.5`}>{load.originAddress1}</p>
            {load.originAddress2 && (
              <p className={`text-sm ${mutedClassName}`}>{load.originAddress2}</p>
            )}
          </div>
          <div className={routeBoxClass}>
            <p className={`text-xs font-medium ${mutedClassName} mb-1`}>Destination</p>
            <p className={`font-semibold ${textClassName}`}>{load.destinationCity}, {load.destinationState} {load.destinationZip}</p>
            <p className={`text-sm ${mutedClassName} mt-0.5`}>{load.destinationAddress1}</p>
            {load.destinationAddress2 && (
              <p className={`text-sm ${mutedClassName}`}>{load.destinationAddress2}</p>
            )}
          </div>
        </div>
        {load.distanceMiles != null && (
          <p className={`mt-2 text-sm ${mutedClassName}`}>
            Estimated distance: <span className={`font-medium ${textClassName}`}>{load.distanceMiles.toLocaleString()} mi</span>
          </p>
        )}
      </section>

      <section>
        <h3 className={`${heading} mb-2`}>Schedule</h3>
        <div className={`grid grid-cols-1 gap-2 sm:grid-cols-2 text-sm ${textClassName}`}>
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
        <h3 className={`${heading} mb-2`}>Cargo</h3>
        <dl className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <dt className={mutedClassName}>Commodity</dt>
            <dd className={`font-medium ${textClassName}`}>{load.commodity}</dd>
          </div>
          <div>
            <dt className={mutedClassName}>Weight</dt>
            <dd className={`font-medium ${textClassName}`}>{load.weightLbs.toLocaleString()} lbs</dd>
          </div>
          <div>
            <dt className={mutedClassName}>Equipment</dt>
            <dd className={`font-medium ${textClassName}`}>{load.equipmentType.replace('_', ' ')}</dd>
          </div>
          {(load.lengthFt != null || load.widthFt != null || load.heightFt != null) && (
            <div className="col-span-3">
              <dt className={mutedClassName}>Dimensions (L × W × H)</dt>
              <dd className={`font-medium ${textClassName}`}>
                {load.lengthFt != null ? formatDimension(load.lengthFt) : '—'}{' × '}
                {load.widthFt != null ? formatDimension(load.widthFt) : '—'}{' × '}
                {load.heightFt != null ? formatDimension(load.heightFt) : '—'}
              </dd>
            </div>
          )}
        </dl>
      </section>

      <section>
        <h3 className={`${heading} mb-2`}>Rate</h3>
        <p className={`text-2xl font-bold ${textClassName}`}>
          ${load.payRate.toLocaleString()}
          <span className={`text-base font-normal ${mutedClassName} ml-1`}>
            {load.payRateType === 'PER_MILE' ? '/mi' : 'flat'}
          </span>
        </p>
        {load.payRateType === 'PER_MILE' && load.distanceMiles != null && (
          <p className={`text-sm ${mutedClassName} mt-1`}>
            ≈ ${(load.payRate * load.distanceMiles).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} estimated total
          </p>
        )}
        {load.paymentTerms && (
          <p className={`text-sm ${mutedClassName} mt-2`}>
            Payment terms:{' '}
            <span className={`font-medium ${textClassName}`}>
              {PAYMENT_TERMS_LABELS[load.paymentTerms]}
            </span>
          </p>
        )}
      </section>

      {load.specialRequirements && (
        <section>
          <h3 className={`${heading} mb-2`}>Notes</h3>
          <p className={`text-sm ${textClassName} whitespace-pre-line`}>{load.specialRequirements}</p>
        </section>
      )}

      {load.cancelReason && (
        <section className={isCarrier
          ? 'rounded-lg bg-[rgba(239,68,68,.08)] border border-[#EF4444]/40 px-4 py-3'
          : 'rounded-lg bg-red-50 border border-red-100 px-4 py-3'}>
          <h3 className={`text-sm font-semibold mb-1 ${isCarrier ? 'text-[#EF4444]' : 'text-red-700'}`}>Cancellation Reason</h3>
          <p className={`text-sm ${isCarrier ? 'text-[#EF4444]' : 'text-red-600'}`}>{load.cancelReason}</p>
        </section>
      )}

      <LoadTimeline loadId={load.id} />
    </div>
  )
}
