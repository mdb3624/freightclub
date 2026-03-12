import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { AxiosError } from 'axios'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import { calculateDistanceMiles } from '../utils/distance'
import type { LoadFormValues } from '../types'

const schema = z.object({
  origin: z.string().min(1, 'Origin city/state is required'),
  originAddress: z.string().min(1, 'Origin address is required'),
  originZip: z.string().min(1, 'Origin zip code is required'),
  destination: z.string().min(1, 'Destination city/state is required'),
  destinationAddress: z.string().min(1, 'Destination address is required'),
  destinationZip: z.string().min(1, 'Destination zip code is required'),
  distanceMiles: z.number().nullable(),
  pickupFrom: z.string().min(1, 'Pickup start is required'),
  pickupTo: z.string().min(1, 'Pickup end is required'),
  deliveryFrom: z.string().min(1, 'Delivery start is required'),
  deliveryTo: z.string().min(1, 'Delivery end is required'),
  commodity: z.string().min(1, 'Commodity is required'),
  weightLbs: z.number({ invalid_type_error: 'Weight is required' }).min(0.01, 'Weight must be > 0'),
  equipmentType: z.enum(['DRY_VAN', 'FLATBED', 'REEFER', 'STEP_DECK']),
  payRate: z.number({ invalid_type_error: 'Pay rate is required' }).min(0.01, 'Pay rate must be > 0'),
  specialRequirements: z.string().optional().default(''),
})

interface LoadFormProps {
  onSubmit: (values: LoadFormValues) => void
  defaultValues?: Partial<LoadFormValues>
  isSubmitting: boolean
  error: unknown
  submitLabel: string
}

export function LoadForm({ onSubmit, defaultValues, isSubmitting, error, submitLabel }: LoadFormProps) {
  const [distanceLoading, setDistanceLoading] = useState(false)
  const [distanceError, setDistanceError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LoadFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      equipmentType: 'DRY_VAN',
      specialRequirements: '',
      distanceMiles: null,
      originZip: '',
      destinationZip: '',
      ...defaultValues,
    },
  })

  const distanceMiles = watch('distanceMiles')
  const originAddress = watch('originAddress')
  const originZip = watch('originZip')
  const destinationAddress = watch('destinationAddress')
  const destinationZip = watch('destinationZip')

  useEffect(() => {
    if (!originAddress || !originZip || !destinationAddress || !destinationZip) return

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      const fullOrigin = `${originAddress} ${originZip}`
      const fullDest = `${destinationAddress} ${destinationZip}`
      setDistanceLoading(true)
      setDistanceError(null)
      try {
        const miles = await calculateDistanceMiles(fullOrigin, fullDest)
        setValue('distanceMiles', miles)
      } catch (e: unknown) {
        setDistanceError(e instanceof Error ? e.message : 'Could not calculate distance')
      } finally {
        setDistanceLoading(false)
      }
    }, 800)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [originAddress, originZip, destinationAddress, destinationZip, setValue])

  const errorMessage = error
    ? ((error as AxiosError<{ message: string }>).response?.data?.message ?? 'An error occurred')
    : null

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {errorMessage && <ErrorBanner message={errorMessage} />}

      {/* Origin */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Origin</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="City, State"
            error={errors.origin?.message}
            placeholder="e.g. Chicago, IL"
            {...register('origin')}
          />
          <Input
            label="Zip Code"
            error={errors.originZip?.message}
            placeholder="e.g. 60601"
            maxLength={10}
            {...register('originZip')}
          />
        </div>
        <Input
          label="Street Address"
          error={errors.originAddress?.message}
          placeholder="e.g. 123 Main St"
          {...register('originAddress')}
        />
      </div>

      {/* Destination */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Destination</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="City, State"
            error={errors.destination?.message}
            placeholder="e.g. Detroit, MI"
            {...register('destination')}
          />
          <Input
            label="Zip Code"
            error={errors.destinationZip?.message}
            placeholder="e.g. 48201"
            maxLength={10}
            {...register('destinationZip')}
          />
        </div>
        <Input
          label="Street Address"
          error={errors.destinationAddress?.message}
          placeholder="e.g. 456 Industrial Blvd"
          {...register('destinationAddress')}
        />
      </div>

      {/* Distance (auto-calculated) */}
      <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3">
        {distanceLoading ? (
          <p className="text-sm text-gray-500">Calculating distance...</p>
        ) : distanceMiles != null ? (
          <p className="text-sm text-gray-900">
            <span className="font-semibold">{distanceMiles.toLocaleString()} mi</span>
            <span className="text-gray-500 ml-1">(estimated road distance)</span>
          </p>
        ) : (
          <p className="text-sm text-gray-400">Distance will calculate automatically once both addresses are filled in</p>
        )}
        {distanceError && <p className="text-xs text-red-600 mt-0.5">{distanceError}</p>}
      </div>

      {/* Schedule */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Pickup From"
          type="datetime-local"
          error={errors.pickupFrom?.message}
          {...register('pickupFrom')}
        />
        <Input
          label="Pickup To"
          type="datetime-local"
          error={errors.pickupTo?.message}
          {...register('pickupTo')}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Delivery From"
          type="datetime-local"
          error={errors.deliveryFrom?.message}
          {...register('deliveryFrom')}
        />
        <Input
          label="Delivery To"
          type="datetime-local"
          error={errors.deliveryTo?.message}
          {...register('deliveryTo')}
        />
      </div>

      {/* Cargo */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Input
          label="Commodity"
          error={errors.commodity?.message}
          placeholder="e.g. Steel coils"
          {...register('commodity')}
        />
        <Input
          label="Weight (lbs)"
          type="number"
          error={errors.weightLbs?.message}
          step="0.01"
          min="0.01"
          {...register('weightLbs', { valueAsNumber: true })}
        />
        <div className="flex flex-col gap-1">
          <label htmlFor="equipmentType" className="text-sm font-medium text-gray-700">
            Equipment Type
          </label>
          <select
            id="equipmentType"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            {...register('equipmentType')}
          >
            <option value="DRY_VAN">Dry Van</option>
            <option value="FLATBED">Flatbed</option>
            <option value="REEFER">Reefer</option>
            <option value="STEP_DECK">Step Deck</option>
          </select>
          {errors.equipmentType && (
            <p className="text-xs text-red-600">{errors.equipmentType.message}</p>
          )}
        </div>
        <Input
          label="Pay Rate ($)"
          type="number"
          error={errors.payRate?.message}
          step="0.01"
          min="0.01"
          {...register('payRate', { valueAsNumber: true })}
        />
      </div>

      <div>
        <label htmlFor="specialRequirements" className="block text-sm font-medium text-gray-700">
          Special Requirements
        </label>
        <textarea
          id="specialRequirements"
          rows={3}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Any special handling or requirements (optional)"
          {...register('specialRequirements')}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
