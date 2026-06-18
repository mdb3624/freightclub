import { useState, useEffect, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import type { UseFormRegister, FieldErrors } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { AxiosError } from 'axios'
import { Input } from '@/components/ui/Input'
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
  equipmentType: z.enum(['DRY_VAN', 'FLATBED', 'REEFER', 'STEP_DECK', 'REFRIGERATED', 'TANKER', 'SPECIALIZED']),
  payRate: z.number({ invalid_type_error: 'Pay rate is required' }).min(0.01, 'Pay rate must be > 0'),
  payRateType: z.enum(['PER_MILE', 'FLAT_RATE']),
  paymentTerms: z.enum(['QUICK_PAY', 'NET_7', 'NET_15', 'NET_30', 'IMMEDIATE', 'NET_14']).or(z.literal('')),
  specialRequirements: z.string().optional().default(''),
  overweightAcknowledged: z.boolean().optional().default(false),
}).superRefine((data, ctx) => {
  if (data.pickupFrom && data.pickupTo && new Date(data.pickupTo) < new Date(data.pickupFrom)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Latest Pickup cannot be before Earliest Pickup',
      path: ['pickupTo'],
    })
  }
  if (data.pickupTo && data.deliveryFrom && new Date(data.deliveryFrom) < new Date(data.pickupTo)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Earliest Delivery cannot be before Latest Pickup',
      path: ['deliveryFrom'],
    })
  }
  if (data.deliveryFrom && data.deliveryTo && new Date(data.deliveryTo) < new Date(data.deliveryFrom)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Latest Delivery cannot be before Earliest Delivery',
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

// Style constants per Shipper Style Guide §6
const selectClass = 'rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500'

const formContainerStyle: React.CSSProperties = {
  background: '#FFFFFF',
  border: '2px solid #C9A46A',
  borderRadius: '12px',
  padding: '32px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  display: 'block',
  width: '100%',
}

const sectionPanelStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #FFFFFF 0%, #FFFBF7 100%)',
  border: '1px solid #E8E3D8',
  borderLeft: '4px solid #B08D57',
  borderRadius: '8px',
  padding: '20px',
}

const bronzeButtonStyle: React.CSSProperties = {
  background: 'linear-gradient(180deg, #C9A46A 0%, #B08D57 45%, #8C6D3F 100%)',
  boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.25), inset 0 -1px 2px rgba(0,0,0,0.2), 0 2px 5px rgba(0,0,0,0.35)',
  border: '1px solid #7A5F3A',
  color: '#FFFFFF',
  height: '44px',
  padding: '0 24px',
  borderRadius: '6px',
  fontWeight: 500,
  cursor: 'pointer',
  fontSize: '14px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '140px',
  transition: 'all 0.2s',
  whiteSpace: 'nowrap',
}

const formActionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '12px',
  marginTop: '24px',
  paddingTop: '24px',
  borderTop: '1px solid #E8E3D8',
  justifyContent: 'flex-end',
}

interface AddressSectionProps {
  prefix: 'origin' | 'destination'
  label: string
  register: UseFormRegister<LoadFormValues>
  errors: FieldErrors<LoadFormValues>
}

function AddressSection({ prefix, label, register, errors }: AddressSectionProps) {
  const addr1Key = `${prefix}Address1` as const
  const addr2Key = `${prefix}Address2` as const
  const cityKey = `${prefix}City` as const
  const stateKey = `${prefix}State` as const
  const zipKey = `${prefix}Zip` as const

  return (
    <div>
      {label && (
        <h3 style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#1A1A1A', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #E8E3D8' }}>
          {label}
        </h3>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <Input
          label="Street Address"
          error={errors[addr1Key]?.message}
          placeholder={prefix === 'origin' ? 'e.g. 123 Main St' : 'e.g. 456 Industrial Blvd'}
          {...register(addr1Key)}
        />
        <Input
          label="Suite / Unit"
          placeholder="Suite (optional)"
          {...register(addr2Key)}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <Input
          label="City"
          error={errors[cityKey]?.message}
          placeholder={prefix === 'origin' ? 'e.g. Chicago' : 'e.g. Detroit'}
          {...register(cityKey)}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', fontWeight: 500, color: '#1A1A1A' }}>State</label>
          <select className={selectClass} {...register(stateKey)} style={{ height: '40px' }}>
            <option value="">Select</option>
            {US_STATES.map(([abbr, name]) => (
              <option key={abbr} value={abbr}>{abbr} — {name}</option>
            ))}
          </select>
          {errors[stateKey] && (
            <p style={{ fontSize: '12px', color: '#E74C3C' }}>{errors[stateKey]?.message}</p>
          )}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
        <Input
          label="ZIP"
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
  onCancel?: () => void
  defaultValues?: Partial<LoadFormValues>
  isSubmitting: boolean
  isDraftSaving?: boolean
  error: unknown
  submitLabel: string
}

export function LoadForm({ onSubmit, onSaveDraft, onCancel, defaultValues, isSubmitting, isDraftSaving, error, submitLabel }: LoadFormProps) {
  const [distanceLoading, setDistanceLoading] = useState(false)
  const [distanceError, setDistanceError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors, isDirty },
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
  const overweightAcknowledged = watch('overweightAcknowledged')
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
    <form onSubmit={handleSubmit(onSubmit)} className="w-full" style={formContainerStyle}>
      {errorMessage && <ErrorBanner message={errorMessage} />}

      {/* 3-Column Grid Layout */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" style={{ marginBottom: '24px' }}>

        {/* LEFT COLUMN: Locations & Timing */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Merged Locations Panel */}
          <div style={sectionPanelStyle}>
            <h3 style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#1A1A1A', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #E8E3D8' }}>
              1. ORIGIN & DESTINATION
            </h3>

            {/* Origin Section */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#A68B5B', marginBottom: '12px' }}>ORIGIN</div>
              <AddressSection prefix="origin" label="" register={register} errors={errors} />
            </div>

            {/* Destination Section */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#A68B5B', marginBottom: '12px' }}>DESTINATION</div>
              <AddressSection prefix="destination" label="" register={register} errors={errors} />
            </div>

            {/* Distance Display */}
            <div style={{ paddingTop: '12px', borderTop: '1px solid #E8E3D8' }}>
              {distanceLoading ? (
                <p style={{ fontSize: '13px', color: '#636E72' }}>Calculating distance...</p>
              ) : distanceMiles != null ? (
                <p style={{ fontSize: '13px', color: '#1A1A1A' }}>
                  <span style={{ fontWeight: 'bold' }}>{distanceMiles.toLocaleString()} mi</span>
                  <span style={{ color: '#636E72', marginLeft: '8px' }}>(estimated)</span>
                </p>
              ) : (
                <p style={{ fontSize: '13px', color: '#999999' }}>Distance calculates when addresses filled</p>
              )}
              {distanceError && <p style={{ fontSize: '12px', color: '#E74C3C', marginTop: '4px' }}>{distanceError}</p>}
            </div>
          </div>

          {/* Schedule Section */}
          <div style={sectionPanelStyle}>
            <h3 style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#1A1A1A', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #E8E3D8' }}>
              3. SCHEDULE
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#A68B5B', marginBottom: '4px' }}>Pickup Window</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <Input
                    label="Earliest Date"
                    type="datetime-local"
                    error={errors.pickupFrom?.message}
                    {...register('pickupFrom')}
                  />
                  <Input
                    label="Latest Date"
                    type="datetime-local"
                    error={errors.pickupTo?.message}
                    {...register('pickupTo')}
                  />
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#A68B5B', marginBottom: '4px' }}>Delivery Window</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <Input
                    label="Earliest Date"
                    type="datetime-local"
                    error={errors.deliveryFrom?.message}
                    {...register('deliveryFrom')}
                  />
                  <Input
                    label="Latest Date"
                    type="datetime-local"
                    error={errors.deliveryTo?.message}
                    {...register('deliveryTo')}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN: Cargo & Equipment */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={sectionPanelStyle}>
            <h3 style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#1A1A1A', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #E8E3D8' }}>
              4. CARGO & EQUIPMENT
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#1A1A1A', marginBottom: '4px' }}>Equipment Type</label>
                <select
                  className={selectClass}
                  {...register('equipmentType')}
                  style={{ height: '40px' }}
                >
                  <option value="DRY_VAN">Dry Van</option>
                  <option value="FLATBED">Flatbed</option>
                  <option value="REFRIGERATED">Refrigerated</option>
                  <option value="TANKER">Tanker</option>
                  <option value="SPECIALIZED">Specialized</option>
                  <option value="STEP_DECK">Step Deck</option>
                </select>
                {errors.equipmentType && (
                  <p style={{ fontSize: '12px', color: '#E74C3C', marginTop: '4px' }}>{errors.equipmentType.message}</p>
                )}
              </div>
              <Input
                label="Commodity"
                error={errors.commodity?.message}
                placeholder="e.g. Steel coils"
                {...register('commodity')}
              />
              <div>
                <Input
                  label="Weight (lbs)"
                  type="number"
                  error={errors.weightLbs?.message}
                  step="0.01"
                  min="0.01"
                  {...register('weightLbs', { valueAsNumber: true })}
                />
                <p style={{ fontSize: '12px', color: '#636E72', marginTop: '4px' }}>Legal max: 80,000 lbs</p>
                {isOverweight && (
                  <div style={{ borderRadius: '4px', border: '1px solid #F39C12', background: '#FFFBF7', padding: '12px', marginTop: '8px' }}>
                    <p style={{ fontSize: '12px', fontWeight: 500, color: '#1A1A1A' }}>
                      Exceeds federal weight limit. Confirm special permit.
                    </p>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        style={{ cursor: 'pointer' }}
                        {...register('overweightAcknowledged')}
                      />
                      <span style={{ fontSize: '12px', color: '#1A1A1A' }}>I confirm special permit</span>
                    </label>
                    {errors.overweightAcknowledged && (
                      <p style={{ fontSize: '12px', color: '#E74C3C', marginTop: '4px' }}>{errors.overweightAcknowledged.message}</p>
                    )}
                  </div>
                )}
              </div>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', color: '#636E72', marginBottom: '8px' }}>Dimensions (Optional)</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {(['Length', 'Width', 'Height'] as const).map((label) => {
                    const ftKey = `${label.toLowerCase()}Ft` as 'lengthFt' | 'widthFt' | 'heightFt'
                    const inKey = `${label.toLowerCase()}In` as 'lengthIn' | 'widthIn' | 'heightIn'
                    return (
                      <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 500, color: '#1A1A1A' }}>{label}</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <div style={{ position: 'relative', flex: 1 }}>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              placeholder="0"
                              style={{ width: '100%', height: '40px', borderRadius: '4px', border: '1px solid #D0D0D0', padding: '8px 8px', fontSize: '13px', paddingRight: '24px' }}
                              {...register(ftKey, { setValueAs: v => v === '' ? '' : Number(v) })}
                            />
                            <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: '#999999', pointerEvents: 'none' }}>ft</span>
                          </div>
                          <div style={{ position: 'relative', flex: 1 }}>
                            <input
                              type="number"
                              min="0"
                              max="11"
                              step="1"
                              placeholder="0"
                              style={{ width: '100%', height: '40px', borderRadius: '4px', border: '1px solid #D0D0D0', padding: '8px 8px', fontSize: '13px', paddingRight: '24px' }}
                              {...register(inKey, {
                                setValueAs: v => v === '' ? '' : Number(v),
                                onBlur: (e) => {
                                  const n = Number(e.target.value)
                                  if (!isNaN(n) && n > 11) setValue(inKey, 0)
                                },
                              })}
                            />
                            <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: '#999999', pointerEvents: 'none' }}>in</span>
                          </div>
                        </div>
                        {(errors[ftKey] || errors[inKey]) && (
                          <p style={{ fontSize: '12px', color: '#E74C3C' }}>{errors[ftKey]?.message ?? errors[inKey]?.message}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
              <div>
                <h4 style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#1A1A1A', marginBottom: '12px', paddingTop: '12px', borderTop: '1px solid #E8E3D8' }}>Special Instructions</h4>
                <label htmlFor="specialRequirements" style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#1A1A1A', marginBottom: '4px' }}>
                  Notes
                </label>
                <textarea
                  id="specialRequirements"
                  rows={3}
                  style={{ width: '100%', borderRadius: '4px', border: '1px solid #D0D0D0', padding: '8px 12px', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', minHeight: '80px' }}
                  placeholder="Any special handling or requirements (optional)"
                  {...register('specialRequirements')}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Payment & Terms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Payment & Terms Panel */}
          <div style={sectionPanelStyle}>
            <h3 style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#1A1A1A', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #E8E3D8' }}>
              5. PAYMENT & TERMS
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#1A1A1A', marginBottom: '4px' }}>Terms</label>
                <select
                  className={selectClass}
                  {...register('paymentTerms')}
                  style={{ height: '40px' }}
                >
                  <option value="">Not specified</option>
                  <option value="IMMEDIATE">Immediate</option>
                  <option value="NET_7">Net 7</option>
                  <option value="NET_14">Net 14</option>
                  <option value="NET_30">Net 30</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#1A1A1A', marginBottom: '4px' }}>Pay Rate</label>
                <div role="group" aria-label="Pay rate type" style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                  {(['FLAT_RATE', 'PER_MILE'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      role="radio"
                      aria-checked={payRateType === type}
                      onClick={() => setValue('payRateType', type, { shouldValidate: true })}
                      style={{
                        flex: 1,
                        height: '32px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        border: '1px solid #D0D0D0',
                        background: payRateType === type ? '#B08D57' : '#F8F9FB',
                        color: payRateType === type ? '#FFFFFF' : '#636E72',
                        transition: 'all 0.2s',
                      }}
                    >
                      {type === 'FLAT_RATE' ? 'Flat' : 'Per Mile'}
                    </button>
                  ))}
                </div>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: '#636E72' }}>$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    style={{ width: '100%', height: '40px', borderRadius: '4px', border: errors.payRate ? '2px solid #E74C3C' : '1px solid #D0D0D0', padding: '8px 8px 8px 28px', fontSize: '13px' }}
                    {...register('payRate', { valueAsNumber: true })}
                  />
                </div>
                <p style={{ fontSize: '12px', color: '#636E72', marginTop: '4px' }}>
                  {payRateType === 'PER_MILE' ? (
                    distanceMiles != null && payRate > 0
                      ? `≈ $${(payRate * distanceMiles).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : 'per mile'
                  ) : 'flat rate'}
                </p>
                {errors.payRate && <p style={{ fontSize: '12px', color: '#E74C3C', marginTop: '4px' }}>{errors.payRate.message}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons — Inside form container, right-aligned */}
      <div style={formActionsStyle}>
        {onCancel && (
          <button
            type="button"
            onClick={() => {
              if (isDirty) {
                if (!window.confirm('Discard this load? Any changes will be lost.')) {
                  return
                }
              }
              onCancel()
            }}
            style={{
              ...bronzeButtonStyle,
              background: 'linear-gradient(180deg, #C9A46A 0%, #B08D57 45%, #8C6D3F 100%)',
            }}
          >
            Cancel
          </button>
        )}
        {onSaveDraft && (
          <button
            type="button"
            onClick={handleSubmit(onSaveDraft)}
            disabled={isDraftSaving}
            style={{
              ...bronzeButtonStyle,
              opacity: isDraftSaving ? 0.6 : 1,
              background: 'linear-gradient(180deg, #C9A46A 0%, #B08D57 45%, #8C6D3F 100%)',
            }}
          >
            {isDraftSaving ? 'Saving...' : 'Save as Draft'}
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || (isOverweight && !overweightAcknowledged)}
          style={{
            ...bronzeButtonStyle,
            opacity: isSubmitting || (isOverweight && !overweightAcknowledged) ? 0.6 : 1,
            background: 'linear-gradient(180deg, #C9A46A 0%, #B08D57 45%, #8C6D3F 100%)',
          }}
          title={isOverweight && !overweightAcknowledged ? 'Acknowledge the overweight warning to continue' : undefined}
        >
          {isSubmitting ? 'Posting...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
