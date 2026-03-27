import { useState, useEffect, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import type { Control, UseFormRegister, FieldErrors } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { AxiosError } from 'axios'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import { calculateDistanceMiles } from '../utils/distance'
import type { LoadFormValues } from '../types'

const US_STATES: [string, string][] = [
  ['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'],
  ['CA', 'California'], ['CO', 'Colorado'], ['CT', 'Connecticut'], ['DE', 'Delaware'],
  ['FL', 'Florida'], ['GA', 'Georgia'], ['HI', 'Hawaii'], ['ID', 'Idaho'],
  ['IL', 'Illinois'], ['IN', 'Indiana'], ['IA', 'Iowa'], ['KS', 'Kansas'],
  ['KY', 'Kentucky'], ['LA', 'Louisiana'], ['ME', 'Maine'], ['MD', 'Maryland'],
  ['MA', 'Massachusetts'], ['MI', 'Michigan'], ['MN', 'Minnesota'], ['MS', 'Mississippi'],
  ['MO', 'Missouri'], ['MT', 'Montana'], ['NE', 'Nebraska'], ['NV', 'Nevada'],
  ['NH', 'New Hampshire'], ['NJ', 'New Jersey'], ['NM', 'New Mexico'], ['NY', 'New York'],
  ['NC', 'North Carolina'], ['ND', 'North Dakota'], ['OH', 'Ohio'], ['OK', 'Oklahoma'],
  ['OR', 'Oregon'], ['PA', 'Pennsylvania'], ['RI', 'Rhode Island'], ['SC', 'South Carolina'],
  ['SD', 'South Dakota'], ['TN', 'Tennessee'], ['TX', 'Texas'], ['UT', 'Utah'],
  ['VT', 'Vermont'], ['VA', 'Virginia'], ['WA', 'Washington'], ['WV', 'West Virginia'],
  ['WI', 'Wisconsin'], ['WY', 'Wyoming'],
]

const schema = z.object({
  originAddress1: z.string().min(1, 'Origin street address is required'),
  originAddress2: z.string().optional().default(''),
  originCity: z.string().min(1, 'Origin city is required'),
  originState: z.string().min(1, 'Select an origin state'),
  originZip: z.string().min(1, 'Origin zip code is required'),
  destinationAddress1: z.string().min(1, 'Destination street address is required'),
  destinationAddress2: z.string().optional().default(''),
  destinationCity: z.string().min(1, 'Destination city is required'),
  destinationState: z.string().min(1, 'Select a destination state'),
  destinationZip: z.string().min(1, 'Destination zip code is required'),
  distanceMiles: z.number().nullable(),
  pickupFrom: z.string().min(1, 'Earliest pickup is required'),
  pickupTo: z.string().optional().default(''),
  deliveryFrom: z.string().min(1, 'Earliest delivery is required'),
  deliveryTo: z.string().optional().default(''),
  commodity: z.string().min(1, 'Commodity is required'),
  weightLbs: z.number({ invalid_type_error: 'Weight is required' }).min(0.01, 'Weight must be > 0'),
  lengthFt: z.union([z.number().min(0), z.literal('')]).optional(),
  lengthIn: z.union([z.number().min(0), z.literal('')]).optional(),
  widthFt: z.union([z.number().min(0), z.literal('')]).optional(),
  widthIn: z.union([z.number().min(0), z.literal('')]).optional(),
  heightFt: z.union([z.number().min(0), z.literal('')]).optional(),
  heightIn: z.union([z.number().min(0), z.literal('')]).optional(),
  equipmentType: z.enum(['DRY_VAN', 'FLATBED', 'REEFER', 'STEP_DECK']),
  payRate: z.number({ invalid_type_error: 'Pay rate is required' }).min(0.01, 'Pay rate must be > 0'),
  payRateType: z.enum(['PER_MILE', 'FLAT_RATE']),
  paymentTerms: z.enum(['QUICK_PAY', 'NET_7', 'NET_15', 'NET_30']).or(z.literal('')),
  specialRequirements: z.string().optional().default(''),
  overweightAcknowledged: z.boolean().optional().default(false),
}).superRefine((data, ctx) => {
  if (data.pickupFrom && data.pickupTo && new Date(data.pickupTo) <= new Date(data.pickupFrom)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Latest Pickup must be after Earliest Pickup',
      path: ['pickupTo'],
    })
  }
  if (data.pickupTo && data.deliveryFrom && new Date(data.deliveryFrom) <= new Date(data.pickupTo)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Earliest Delivery must be after Latest Pickup',
      path: ['deliveryFrom'],
    })
  }
  if (data.deliveryFrom && data.deliveryTo && new Date(data.deliveryTo) <= new Date(data.deliveryFrom)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Latest Delivery must be after Earliest Delivery',
      path: ['deliveryTo'],
    })
  }
  if (typeof data.weightLbs === 'number' && data.weightLbs > 80000 && !data.overweightAcknowledged) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Confirm this load has a valid special permit before submitting',
      path: ['overweightAcknowledged'],
    })
  }
})

const selectClass = 'rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500'

interface AddressSectionProps {
  prefix: 'origin' | 'destination'
  register: UseFormRegister<LoadFormValues>
  errors: FieldErrors<LoadFormValues>
}

function AddressSection({ prefix, register, errors }: AddressSectionProps) {
  const addr1Key = `${prefix}Address1` as const
  const addr2Key = `${prefix}Address2` as const
  const cityKey = `${prefix}City` as const
  const stateKey = `${prefix}State` as const
  const zipKey = `${prefix}Zip` as const
  const label = prefix === 'origin' ? 'Origin' : 'Destination'

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{label}</h3>
      <Input
        label="Street Address"
        error={errors[addr1Key]?.message}
        placeholder={prefix === 'origin' ? 'e.g. 123 Main St' : 'e.g. 456 Industrial Blvd'}
        {...register(addr1Key)}
      />
      <Input
        label="Suite / Unit"
        placeholder="Suite, unit, building (optional)"
        {...register(addr2Key)}
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Input
          label="City"
          error={errors[cityKey]?.message}
          placeholder={prefix === 'origin' ? 'e.g. Chicago' : 'e.g. Detroit'}
          {...register(cityKey)}
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">State</label>
          <select className={selectClass} {...register(stateKey)}>
            <option value="">Select state</option>
            {US_STATES.map(([abbr, name]) => (
              <option key={abbr} value={abbr}>{abbr} — {name}</option>
            ))}
          </select>
          {errors[stateKey] && (
            <p className="text-xs text-red-600">{errors[stateKey]?.message}</p>
          )}
        </div>
        <Input
          label="Zip Code"
          error={errors[zipKey]?.message}
          placeholder="e.g. 60601"
          maxLength={10}
          {...register(zipKey)}
        />
      </div>
    </div>
  )
}

interface LoadFormProps {
  onSubmit: (values: LoadFormValues) => void
  onSaveDraft?: (values: LoadFormValues) => void
  defaultValues?: Partial<LoadFormValues>
  isSubmitting: boolean
  isDraftSaving?: boolean
  error: unknown
  submitLabel: string
}

export function LoadForm({ onSubmit, onSaveDraft, defaultValues, isSubmitting, isDraftSaving, error, submitLabel }: LoadFormProps) {
  const [distanceLoading, setDistanceLoading] = useState(false)
  const [distanceError, setDistanceError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    control,
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
      originAddress2: '',
      destinationZip: '',
      destinationAddress2: '',
      lengthFt: '',
      lengthIn: '',
      widthFt: '',
      widthIn: '',
      heightFt: '',
      heightIn: '',
      ...defaultValues,
    },
  })

  const distanceMiles = watch('distanceMiles')
  const weightLbs = watch('weightLbs')
  const isOverweight = typeof weightLbs === 'number' && weightLbs > 80000
  const payRateType = watch('payRateType')
  const payRate = watch('payRate')
  const pickupFrom = watch('pickupFrom')
  const pickupTo = watch('pickupTo')
  const deliveryFrom = watch('deliveryFrom')
  const deliveryTo = watch('deliveryTo')

  const [
    originCity, originState, originZip, originAddress1, originAddress2,
    destinationCity, destinationState, destinationZip, destinationAddress1, destinationAddress2,
  ] = useWatch({
    control,
    name: [
      'originCity', 'originState', 'originZip', 'originAddress1', 'originAddress2',
      'destinationCity', 'destinationState', 'destinationZip', 'destinationAddress1', 'destinationAddress2',
    ],
  })

  useEffect(() => {
    if (!originAddress1 || !originCity || !originState || !originZip) return
    if (!destinationAddress1 || !destinationCity || !destinationState || !destinationZip) return

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      const addr2Origin = originAddress2 ? ` ${originAddress2}` : ''
      const addr2Dest = destinationAddress2 ? ` ${destinationAddress2}` : ''
      const fullOrigin = `${originAddress1}${addr2Origin}, ${originCity}, ${originState} ${originZip}`
      const fullDest = `${destinationAddress1}${addr2Dest}, ${destinationCity}, ${destinationState} ${destinationZip}`
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
  }, [originAddress1, originAddress2, originCity, originState, originZip,
      destinationAddress1, destinationAddress2, destinationCity, destinationState, destinationZip, setValue])

  // Auto-populate Latest Pickup from Earliest Pickup when it's empty
  useEffect(() => {
    if (pickupFrom && !pickupTo) {
      setValue('pickupTo', pickupFrom, { shouldValidate: false })
    }
  }, [pickupFrom]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-populate Latest Delivery from Earliest Delivery when it's empty
  useEffect(() => {
    if (deliveryFrom && !deliveryTo) {
      setValue('deliveryTo', deliveryFrom, { shouldValidate: false })
    }
  }, [deliveryFrom]) // eslint-disable-line react-hooks/exhaustive-deps

  const errorMessage = error
    ? ((error as AxiosError<{ message: string }>).response?.data?.message ?? 'An error occurred')
    : null

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {errorMessage && <ErrorBanner message={errorMessage} />}

      <AddressSection prefix="origin" register={register} errors={errors} />
      <AddressSection prefix="destination" register={register} errors={errors} />

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
          label="Earliest Pickup"
          type="datetime-local"
          error={errors.pickupFrom?.message}
          {...register('pickupFrom')}
        />
        <Input
          label="Latest Pickup"
          type="datetime-local"
          error={errors.pickupTo?.message}
          {...register('pickupTo')}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Earliest Delivery"
          type="datetime-local"
          error={errors.deliveryFrom?.message}
          {...register('deliveryFrom')}
        />
        <Input
          label="Latest Delivery"
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
        <div className="flex flex-col gap-1">
          <Input
            label="Weight (lbs)"
            type="number"
            error={errors.weightLbs?.message}
            step="0.01"
            min="0.01"
            {...register('weightLbs', { valueAsNumber: true })}
          />
          <p className="text-xs text-gray-400">Legal max: 80,000 lbs</p>
          {isOverweight && (
            <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 mt-1">
              <p className="text-xs font-medium text-amber-800">
                Exceeds federal weight limit. Confirm this load requires a special permit.
              </p>
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-amber-400 text-amber-600 focus:ring-amber-500"
                  {...register('overweightAcknowledged')}
                />
                <span className="text-xs text-amber-800">I confirm this load has or will have a special permit</span>
              </label>
              {errors.overweightAcknowledged && (
                <p className="text-xs text-red-600 mt-1">{errors.overweightAcknowledged.message}</p>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {(['Length', 'Width', 'Height'] as const).map((label) => {
          const ftKey = `${label.toLowerCase()}Ft` as 'lengthFt' | 'widthFt' | 'heightFt'
          const inKey = `${label.toLowerCase()}In` as 'lengthIn' | 'widthIn' | 'heightIn'
          return (
            <div key={label} className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-700">
                {label} <span className="text-gray-400 font-normal text-xs">(optional)</span>
              </span>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 pr-8 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    {...register(ftKey, { setValueAs: v => v === '' ? '' : Number(v) })}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">ft</span>
                </div>
                <div className="relative flex-1">
                  <input
                    type="number"
                    min="0"
                    max="11"
                    step="1"
                    placeholder="0"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 pr-8 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    {...register(inKey, {
                      setValueAs: v => v === '' ? '' : Number(v),
                      onBlur: (e) => {
                        const n = Number(e.target.value)
                        if (!isNaN(n) && n > 11) setValue(inKey, 0)
                      },
                    })}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">in</span>
                </div>
              </div>
              {(errors[ftKey] || errors[inKey]) && (
                <p className="text-xs text-red-600">{errors[ftKey]?.message ?? errors[inKey]?.message}</p>
              )}
            </div>
          )
        })}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="equipmentType" className="text-sm font-medium text-gray-700">
            Equipment Type
          </label>
          <select
            id="equipmentType"
            className={selectClass}
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
          <div role="group" aria-label="Pay rate type" className="flex gap-1 mb-1">
            {(['FLAT_RATE', 'PER_MILE'] as const).map((type) => (
              <button
                key={type}
                type="button"
                role="radio"
                aria-checked={payRateType === type}
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
          className={`${selectClass} max-w-xs`}
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

      <div className="flex justify-end gap-3">
        {onSaveDraft && (
          <Button
            type="button"
            variant="secondary"
            isLoading={isDraftSaving}
            onClick={handleSubmit(onSaveDraft)}
          >
            Save as Draft
          </Button>
        )}
        <Button
          type="submit"
          isLoading={isSubmitting}
          disabled={isOverweight && !weightAcknowledged}
          title={isOverweight && !weightAcknowledged ? 'Acknowledge the overweight warning above to continue' : undefined}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
