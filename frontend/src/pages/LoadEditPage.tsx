import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useLoad } from '@/features/loads/hooks/useLoad'
import { useUpdateLoad } from '@/features/loads/hooks/useUpdateLoad'
import { LoadForm } from '@/features/loads/components/LoadForm'
import type { LoadFormValues } from '@/features/loads/types'

const editableStatuses = new Set(['DRAFT', 'OPEN'])

export function LoadEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: load, isLoading } = useLoad(id)
  const { mutate, isPending, error } = useUpdateLoad(id!)

  useEffect(() => {
    if (load && !editableStatuses.has(load.status)) {
      navigate('/dashboard/shipper', { replace: true })
    }
  }, [load, id, navigate])

  if (isLoading || !load) return <p className="text-center text-gray-500 py-12">Loading...</p>

  const defaultValues: Partial<LoadFormValues> = {
    origin: load.origin,
    originAddress: load.originAddress,
    originZip: load.originZip,
    destination: load.destination,
    destinationAddress: load.destinationAddress,
    destinationZip: load.destinationZip,
    distanceMiles: load.distanceMiles,
    pickupFrom: load.pickupFrom.slice(0, 16),
    pickupTo: load.pickupTo.slice(0, 16),
    deliveryFrom: load.deliveryFrom.slice(0, 16),
    deliveryTo: load.deliveryTo.slice(0, 16),
    commodity: load.commodity,
    weightLbs: load.weightLbs,
    equipmentType: load.equipmentType,
    payRate: load.payRate,
    payRateType: load.payRateType,
    paymentTerms: load.paymentTerms ?? '',
    specialRequirements: load.specialRequirements ?? '',
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6">
        <Link to="/dashboard/shipper" className="text-sm text-primary-600 hover:underline">
          ← Back to Dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900">Edit Load</h1>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <LoadForm
          onSubmit={mutate}
          defaultValues={defaultValues}
          isSubmitting={isPending}
          error={error}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  )
}
