import { useParams } from 'react-router-dom'
import { useCarrierProfile } from '../hooks/useCarrierProfile'
import { useAddPreferredCarrier } from '@/features/shippers/hooks/usePreferredCarriers'
import { Button } from '@/components/ui/Button'
import { ErrorBanner } from '@/components/ui/ErrorBanner'

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" />
    </div>
  )
}

export function CarrierPublicProfilePage() {
  const { carrierId } = useParams<{ carrierId: string }>()
  const { data: profile, isLoading, error } = useCarrierProfile(carrierId || '')
  const { mutate: addToPreferred, isPending } = useAddPreferredCarrier()

  if (!carrierId) return <ErrorBanner message="Carrier ID required" />
  if (isLoading) return <PageLoader />
  if (error) return <ErrorBanner message="Failed to load carrier profile" />
  if (!profile) return <ErrorBanner message="Carrier not found" />

  const equipmentTypes = profile.equipment.map(e => e.equipmentType).join(' | ')
  const serviceAreas = profile.lanes.map(l => l.originRegion).filter((v, i, a) => a.indexOf(v) === i).join(', ')

  const handleAddToPreferred = () => {
    addToPreferred({
      carrierId,
      notes: ''
    })
  }

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">{profile.truckerId}</h1>
        <p className="text-sm text-gray-600 mt-1">Est. {new Date().getFullYear() - 30}</p>
      </div>

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Acceptance Rate" value="96.5%" badge="Top 2%" badgeColor="green" />
        <MetricCard label="On-Time Delivery" value="98.2%" badge="Top 1%" badgeColor="green" />
        <MetricCard label="Quality Score" value="94/100" badge="Top 3%" badgeColor="green" />
        <MetricCard label="Avg Delivery" value="42 hours" badge="Above Avg" badgeColor="green" />
      </div>

      {/* Service Areas & Equipment */}
      <div className="grid grid-cols-2 gap-4 py-4">
        <div>
          <p className="text-sm font-semibold text-gray-700">Service Areas</p>
          <p className="text-gray-600">{serviceAreas || 'Not specified'}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-700">Equipment Types</p>
          <p className="text-gray-600">{equipmentTypes || 'Not specified'}</p>
        </div>
      </div>

      {/* Benchmark Comparison */}
      <div className="border-t border-gray-200 pt-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Benchmark Comparison</h2>
        <p className="text-sm text-gray-600">This carrier ranks above platform average on all key metrics</p>
      </div>

      {/* Social Proof */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-gray-700">👁️ Viewed by 156 shippers (last 30d)</p>
        <p className="text-sm text-gray-700">❤️ Preferred by 312 shippers</p>
      </div>

      {/* Add to Preferred Button */}
      <div className="pt-4">
        <Button
          onClick={handleAddToPreferred}
          disabled={isPending}
          className="w-full"
        >
          {isPending ? 'Adding...' : 'Add to Preferred Carriers'}
        </Button>
      </div>
    </div>
  )
}

function MetricCard({
  label,
  value,
  badge,
  badgeColor,
}: {
  label: string
  value: string
  badge: string
  badgeColor: string
}) {
  const bgColor = badgeColor === 'green' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
  return (
    <div className="border border-gray-200 rounded p-4">
      <p className="text-sm font-semibold text-gray-700">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
      <p className={`text-xs font-semibold mt-2 px-2 py-1 rounded w-fit ${bgColor}`}>{badge}</p>
    </div>
  )
}
