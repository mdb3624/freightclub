import type { Load } from '../types'
import { StatusBadge } from './StatusBadge'

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
            <p className="font-semibold text-gray-900">{load.origin} {load.originZip}</p>
            <p className="text-sm text-gray-600 mt-0.5">{load.originAddress}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs font-medium text-gray-500 mb-1">Destination</p>
            <p className="font-semibold text-gray-900">{load.destination} {load.destinationZip}</p>
            <p className="text-sm text-gray-600 mt-0.5">{load.destinationAddress}</p>
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
      </section>

      {load.specialRequirements && (
        <section>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Notes</h3>
          <p className="text-sm text-gray-700 whitespace-pre-line">{load.specialRequirements}</p>
        </section>
      )}
    </div>
  )
}
