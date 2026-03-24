import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AppShell } from '@/components/AppShell'
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

  function splitDecimalFt(val: number | null): { ft: number | ''; inches: number | '' } {
    if (val == null) return { ft: '', inches: '' }
    const totalIn = Math.round(val * 12)
    return { ft: Math.floor(totalIn / 12), inches: totalIn % 12 }
  }

  const length = splitDecimalFt(load.lengthFt)
  const width = splitDecimalFt(load.widthFt)
  const height = splitDecimalFt(load.heightFt)

  const defaultValues: Partial<LoadFormValues> = {
    originCity: load.originCity,
    originState: load.originState,
    originZip: load.originZip,
    originAddress1: load.originAddress1,
    originAddress2: load.originAddress2 ?? '',
    destinationCity: load.destinationCity,
    destinationState: load.destinationState,
    destinationZip: load.destinationZip,
    destinationAddress1: load.destinationAddress1,
    destinationAddress2: load.destinationAddress2 ?? '',
    distanceMiles: load.distanceMiles,
    pickupFrom: load.pickupFrom.slice(0, 16),
    pickupTo: load.pickupTo.slice(0, 16),
    deliveryFrom: load.deliveryFrom.slice(0, 16),
    deliveryTo: load.deliveryTo.slice(0, 16),
    commodity: load.commodity,
    weightLbs: load.weightLbs,
    lengthFt: length.ft,
    lengthIn: length.inches,
    widthFt: width.ft,
    widthIn: width.inches,
    heightFt: height.ft,
    heightIn: height.inches,
    equipmentType: load.equipmentType,
    payRate: load.payRate,
    payRateType: load.payRateType,
    paymentTerms: load.paymentTerms ?? '',
    specialRequirements: load.specialRequirements ?? '',
  }

  return (
    <AppShell maxWidth="xl">
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
    </AppShell>
  )
}
