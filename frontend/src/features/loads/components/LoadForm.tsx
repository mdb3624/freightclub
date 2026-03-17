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
  payRateType: z.enum(['PER_MILE', 'FLAT_RATE']),
  paymentTerms: z.enum(['QUICK_PAY', 'NET_7', 'NET_15', 'NET_30']).or(z.literal('')),
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
      payRateType: 'FLAT_RATE',
      paymentTerms: '',
      specialRequirements: '',
      distanceMiles: null,
      originZip: '',
      destinationZip: '',
      ...defaultValues,
    },
  })

  const distanceMiles = watch('distanceMiles')
  const payRateType = watch('payRateType')
  const payRate = watch('payRate')
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
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Pay Rate</label>
          <div className="flex gap-1 mb-1">
            {(['FLAT_RATE', 'PER_MILE'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setValue('payRateType', type, { shouldValidate: true })}
                className={`flex-1 rounded py-1 text-xs font-medium transition-colors ${
                  payRateType === type
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {type === 'FLAT_RATE' ? 'Flat Rate' : 'Per Mile'}
              </button>
            ))}
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">$</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              className={`w-full rounded-md border px-3 py-2 pl-6 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.payRate ? 'border-red-500' : 'border-gray-300'}`}
              {...register('payRate', { valueAsNumber: true })}
            />
          </div>
          <p className="text-xs text-gray-500">
            {payRateType === 'PER_MILE' ? (
              distanceMiles != null && payRate > 0
                ? `≈ $${(payRate * distanceMiles).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} estimated total`
                : 'per mile'
            ) : 'flat rate'}
          </p>
          {errors.payRate && <p className="text-xs text-red-600">{errors.payRate.message}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="paymentTerms" className="text-sm font-medium text-gray-700">
          Payment Terms
        </label>
        <select
          id="paymentTerms"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 max-w-xs"
          {...register('paymentTerms')}
        >
          <option value="">Not specified</option>
          <option value="QUICK_PAY">Quick Pay</option>
          <option value="NET_7">Net 7</option>
          <option value="NET_15">Net 15</option>
          <option value="NET_30">Net 30</option>
        </select>
        <p className="text-xs text-gray-500">
          Quick Pay = same day or next day. Net 7/15/30 = days after delivery.
        </p>
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
