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
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Latest Pickup cannot be before Earliest Pickup', path: ['pickupTo'] })
  }
  if (data.pickupTo && data.deliveryFrom && new Date(data.deliveryFrom) < new Date(data.pickupTo)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Earliest Delivery cannot be before Latest Pickup', path: ['deliveryFrom'] })
  }
  if (data.deliveryFrom && data.deliveryTo && new Date(data.deliveryTo) < new Date(data.deliveryFrom)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Latest Delivery cannot be before Earliest Delivery', path: ['deliveryTo'] })
  }
  if (typeof data.weightLbs === 'number' && data.weightLbs > 80000 && !data.overweightAcknowledged) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Confirm this load has a valid special permit before submitting', path: ['overweightAcknowledged'] })
  }
})

// ── Style constants (SHIPPER_DESIGN_SYSTEM.md §6.3 / §6.5) ──────────────────

const sectionPanelStyle: React.CSSProperties = {
  background: '#FFFFFF',
  border: '1px solid #D0D0D0',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  padding: '24px',
}

const bronzeButtonStyle: React.CSSProperties = {
  background: 'linear-gradient(180deg, #C9A46A 0%, #B08D57 45%, #8C6D3F 100%)',
  boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.25), inset 0 -1px 2px rgba(0,0,0,0.2), 0 2px 5px rgba(0,0,0,0.35)',
  border: '1px solid #7A5F3A',
  color: '#FFFFFF',
  height: '44px',
  padding: '0 24px',
  borderRadius: '4px',
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: '14px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '140px',
  whiteSpace: 'nowrap' as const,
}

const selectClass = 'rounded border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600'

const subLabelStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
  color: '#B08D57',
  marginBottom: '10px',
}

// ── Small reusable helpers ────────────────────────────────────────────────────

function SectionTitle({ emoji, children }: { emoji: string; children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: 'Sora, sans-serif', fontSize: '15px', fontWeight: 700, color: '#1A1A1A',
      borderBottom: '1px solid #E8E3D8', paddingBottom: '12px', marginBottom: '16px',
      display: 'flex', alignItems: 'center', gap: '8px',
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 6, flexShrink: 0,
        background: 'linear-gradient(135deg, #FAF6EE, #F0E9D8)',
        border: '1px solid #C9A876',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
      }}>
        {emoji}
      </div>
      {children}
    </div>
  )
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#636E72', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>
      {children}{required && <span style={{ color: '#E74C3C', marginLeft: '2px' }}>*</span>}
    </label>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p role="alert" style={{ fontSize: '12px', fontStyle: 'italic', color: '#B91C1C', marginTop: '4px' }}>⚠ {message}</p>
}

// ── AddressSection ─────────────────────────────────────────────────────────────

interface AddressSectionProps {
  prefix: 'origin' | 'destination'
  register: UseFormRegister<LoadFormValues>
  errors: FieldErrors<LoadFormValues>
}

function AddressSection({ prefix, register, errors }: AddressSectionProps) {
  const addr1Key = `${prefix}Address1` as const
  const addr2Key = `${prefix}Address2` as const
  const cityKey  = `${prefix}City`     as const
  const stateKey = `${prefix}State`    as const
  const zipKey   = `${prefix}Zip`      as const

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <Input label="Street Address" error={errors[addr1Key]?.message} testId={addr1Key}
          placeholder={prefix === 'origin' ? 'e.g. 123 Main St' : 'e.g. 456 Industrial Blvd'}
          {...register(addr1Key)} />
        <Input label="Suite / Unit" placeholder="Suite (optional)" testId={addr2Key} {...register(addr2Key)} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <Input label="City" error={errors[cityKey]?.message} testId={cityKey}
          placeholder={prefix === 'origin' ? 'e.g. Chicago' : 'e.g. Detroit'}
          {...register(cityKey)} />
        <div>
          <FieldLabel>State</FieldLabel>
          <select data-testid={stateKey} className={selectClass} {...register(stateKey)} style={{ height: '40px', width: '100%' }}>
            <option value="">Select</option>
            {US_STATES.map(([abbr, name]) => <option key={abbr} value={abbr}>{abbr} — {name}</option>)}
          </select>
          <FieldError message={errors[stateKey]?.message} />
        </div>
      </div>
      <Input label="ZIP" error={errors[zipKey]?.message} testId={zipKey} placeholder="e.g. 60601" maxLength={10} {...register(zipKey)} />
    </div>
  )
}

// ── LoadForm ──────────────────────────────────────────────────────────────────

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
  const [distanceError, setDistanceError]     = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { register, handleSubmit, watch, control, setValue, formState: { errors, isDirty } } =
    useForm<LoadFormValues>({
      resolver: zodResolver(schema),
      defaultValues: {
        equipmentType: 'DRY_VAN', payRateType: 'FLAT_RATE', paymentTerms: '',
        specialRequirements: '', distanceMiles: null,
        originZip: '', originAddress2: '', destinationZip: '', destinationAddress2: '',
        lengthFt: '', lengthIn: '', widthFt: '', widthIn: '', heightFt: '', heightIn: '',
        ...defaultValues,
      },
    })

  const distanceMiles          = watch('distanceMiles')
  const weightLbs              = watch('weightLbs')
  const isOverweight           = typeof weightLbs === 'number' && weightLbs > 80000
  const overweightAcknowledged = watch('overweightAcknowledged')
  const payRateType            = watch('payRateType')
  const payRate                = watch('payRate')
  const pickupFrom             = watch('pickupFrom')
  const pickupTo               = watch('pickupTo')
  const deliveryFrom           = watch('deliveryFrom')
  const deliveryTo             = watch('deliveryTo')
  const commodity              = watch('commodity')
  const equipmentType          = watch('equipmentType')

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

  // Distance auto-calculation (debounced)
  useEffect(() => {
    if (!originAddress1 || !originCity || !originState || !originZip) return
    if (!destinationAddress1 || !destinationCity || !destinationState || !destinationZip) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const o2 = originAddress2 ? ` ${originAddress2}` : ''
      const d2 = destinationAddress2 ? ` ${destinationAddress2}` : ''
      const fullOrigin = `${originAddress1}${o2}, ${originCity}, ${originState} ${originZip}`
      const fullDest   = `${destinationAddress1}${d2}, ${destinationCity}, ${destinationState} ${destinationZip}`
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
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [originAddress1, originAddress2, originCity, originState, originZip,
      destinationAddress1, destinationAddress2, destinationCity, destinationState, destinationZip, setValue])

  // AC-3: Auto-populate Latest Pickup from Earliest Pickup when empty
  useEffect(() => {
    if (pickupFrom && !pickupTo) setValue('pickupTo', pickupFrom, { shouldValidate: false })
  }, [pickupFrom]) // eslint-disable-line react-hooks/exhaustive-deps

  // AC-4: Auto-populate Latest Delivery from Earliest Delivery when empty
  useEffect(() => {
    if (deliveryFrom && !deliveryTo) setValue('deliveryTo', deliveryFrom, { shouldValidate: false })
  }, [deliveryFrom]) // eslint-disable-line react-hooks/exhaustive-deps

  // Completeness score: 10 checks × 10%
  const completeness = (() => {
    const checks = [
      !!(originAddress1 && originCity && originState && originZip),
      !!(destinationAddress1 && destinationCity && destinationState && destinationZip),
      !!commodity,
      !!(typeof weightLbs === 'number' && weightLbs > 0),
      !!pickupFrom,
      !!deliveryFrom,
      !!equipmentType,
      !!(typeof payRate === 'number' && payRate > 0),
      true, // payRateType always has a default
      true, // paymentTerms is optional
    ]
    return Math.round(checks.filter(Boolean).length * 10)
  })()

  const completenessColor    = completeness >= 80 ? '#27AE60' : completeness >= 50 ? '#F39C12' : '#636E72'
  const completenessBarColor = completeness >= 80 ? '#27AE60' : completeness >= 50 ? '#B08D57' : '#D0CCC4'
  const nudgeText = completeness < 40 ? 'Add route and schedule to continue'
    : completeness < 70 ? 'Add pay rate to publish'
    : 'Ready to publish'

  const rpm = payRateType === 'FLAT_RATE' && distanceMiles && distanceMiles > 0 && payRate > 0
    ? payRate / distanceMiles
    : payRateType === 'PER_MILE' && payRate > 0 ? payRate : null

  const errorMessage = error
    ? ((error as AxiosError<{ message: string }>).response?.data?.message ?? 'An error occurred')
    : null

  const publishDisabled = isSubmitting || completeness < 40 || (isOverweight && !overweightAcknowledged)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      {errorMessage && <ErrorBanner message={errorMessage} />}

      {/* 2-column grid: form (1fr) + preview panel (320px) */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6" style={{ alignItems: 'start', marginBottom: '0' }}>

        {/* ── LEFT: form sections ────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Section 1: Route */}
          <div style={sectionPanelStyle}>
            <SectionTitle emoji="🗺">Route</SectionTitle>

            <div style={{ marginBottom: '20px' }}>
              <div style={subLabelStyle}>Origin</div>
              <AddressSection prefix="origin" register={register} errors={errors} />
            </div>

            <div style={{ paddingTop: '16px', borderTop: '1px solid #F0EBE0', marginBottom: '16px' }}>
              <div style={subLabelStyle}>Destination</div>
              <AddressSection prefix="destination" register={register} errors={errors} />
            </div>

            {/* AC-1: Read-only distance display */}
            <div style={{ paddingTop: '16px', borderTop: '1px solid #E8E3D8' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#636E72', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>
                Est. Distance
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  data-testid="distance-display"
                  style={{
                    flex: 1, height: '40px', minWidth: '160px',
                    background: '#F8F9FB', border: '1px solid #E8E3D8', borderRadius: '4px',
                    padding: '8px 12px', fontSize: '14px',
                    display: 'flex', alignItems: 'center',
                    color: distanceMiles != null ? '#1A1A1A' : '#9CA3AF',
                    fontWeight: distanceMiles != null ? 700 : 400,
                  }}
                >
                  {distanceLoading
                    ? 'Calculating...'
                    : distanceMiles != null
                    ? `${distanceMiles.toLocaleString()} mi`
                    : 'Select states above'}
                </div>
                <span style={{ fontSize: '12px', color: '#9CA3AF', whiteSpace: 'nowrap' }}>calculated</span>
              </div>
              {distanceError && <FieldError message={distanceError} />}
            </div>
          </div>

          {/* Section 2: Schedule */}
          <div style={sectionPanelStyle}>
            <SectionTitle emoji="📅">Schedule</SectionTitle>

            {/* AC-3: Pickup Window */}
            <div style={{ marginBottom: '16px' }}>
              <div style={subLabelStyle}>Pickup Window</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Input label="Earliest pickup" type="datetime-local" testId="pickup-from-input"
                  error={errors.pickupFrom?.message} {...register('pickupFrom')} />
                <div>
                  <Input label="Latest pickup" type="datetime-local" testId="pickup-to-input"
                    {...register('pickupTo')} />
                  {errors.pickupTo?.message
                    ? <FieldError message={errors.pickupTo.message} />
                    : <p style={{ fontSize: '12px', fontStyle: 'italic', color: '#9CA3AF', marginTop: '4px' }}>Auto-filled from earliest — adjust if flexible</p>
                  }
                </div>
              </div>
            </div>

            {/* AC-4: Delivery Window */}
            <div style={{ paddingTop: '16px', borderTop: '1px solid #F0EBE0' }}>
              <div style={subLabelStyle}>Delivery Window</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <Input label="Earliest delivery" type="datetime-local" testId="delivery-from-input"
                    {...register('deliveryFrom')} />
                  <FieldError message={errors.deliveryFrom?.message} />
                </div>
                <div>
                  <Input label="Latest delivery" type="datetime-local" testId="delivery-to-input"
                    {...register('deliveryTo')} />
                  {errors.deliveryTo?.message
                    ? <FieldError message={errors.deliveryTo.message} />
                    : <p style={{ fontSize: '12px', fontStyle: 'italic', color: '#9CA3AF', marginTop: '4px' }}>Auto-filled from earliest — adjust if flexible</p>
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Load Details */}
          <div style={sectionPanelStyle}>
            <SectionTitle emoji="📦">Load Details</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

              <div>
                <FieldLabel>Equipment Type</FieldLabel>
                <select className={selectClass} {...register('equipmentType')} style={{ height: '40px', width: '100%' }}>
                  <option value="DRY_VAN">Dry Van</option>
                  <option value="FLATBED">Flatbed</option>
                  <option value="REFRIGERATED">Refrigerated</option>
                  <option value="TANKER">Tanker</option>
                  <option value="SPECIALIZED">Specialized</option>
                  <option value="STEP_DECK">Step Deck</option>
                </select>
                <FieldError message={errors.equipmentType?.message} />
              </div>

              <Input label="Commodity" error={errors.commodity?.message} testId="commodity"
                placeholder="e.g. Steel coils" {...register('commodity')} />

              <div>
                <Input label="Weight (lbs)" type="number" error={errors.weightLbs?.message} testId="weightLbs"
                  step="0.01" min="0.01" {...register('weightLbs', { valueAsNumber: true })} />
                <p style={{ fontSize: '12px', color: '#636E72', marginTop: '4px' }}>Legal max: 80,000 lbs</p>
                {isOverweight && (
                  <div style={{ borderRadius: '4px', border: '1px solid #F39C12', background: '#FFFBF7', padding: '12px', marginTop: '8px' }}>
                    <p style={{ fontSize: '12px', fontWeight: 500, color: '#1A1A1A' }}>Exceeds federal weight limit. Confirm special permit.</p>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', cursor: 'pointer' }}>
                      <input type="checkbox" style={{ cursor: 'pointer' }} {...register('overweightAcknowledged')} />
                      <span style={{ fontSize: '12px', color: '#1A1A1A' }}>I confirm special permit</span>
                    </label>
                    <FieldError message={errors.overweightAcknowledged?.message} />
                  </div>
                )}
              </div>

              {/* AC-5: Dimension ft + in fields */}
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#636E72', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dimensions</span>
                  <span style={{ fontSize: '11px', color: '#9CA3AF' }}>(optional)</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {(['Length', 'Width', 'Height'] as const).map((label) => {
                    const ftKey = `${label.toLowerCase()}Ft` as 'lengthFt' | 'widthFt' | 'heightFt'
                    const inKey = `${label.toLowerCase()}In` as 'lengthIn' | 'widthIn' | 'heightIn'
                    return (
                      <div key={label}>
                        <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '4px' }}>{label}</div>
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                          <div style={{ position: 'relative', flex: 1 }}>
                            <input
                              data-testid={`${label.toLowerCase()}-ft-input`}
                              type="number" min="0" step="1" placeholder="0"
                              style={{ width: '100%', height: '40px', borderRadius: '4px', border: '1px solid #D0D0D0', padding: '8px 24px 8px 8px', fontSize: '13px' }}
                              {...register(ftKey, { setValueAs: v => v === '' ? '' : Number(v) })}
                            />
                            <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', color: '#9CA3AF', pointerEvents: 'none' }}>ft</span>
                          </div>
                          <div style={{ position: 'relative', flex: 1 }}>
                            <input
                              data-testid={`${label.toLowerCase()}-in-input`}
                              type="number" min="0" max="11" step="1" placeholder="0"
                              style={{ width: '100%', height: '40px', borderRadius: '4px', border: '1px solid #D0D0D0', padding: '8px 24px 8px 8px', fontSize: '13px' }}
                              {...register(inKey, {
                                setValueAs: v => v === '' ? '' : Number(v),
                                onBlur: (e) => { const n = Number(e.target.value); if (!isNaN(n) && n > 11) setValue(inKey, 0) },
                              })}
                            />
                            <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', color: '#9CA3AF', pointerEvents: 'none' }}>in</span>
                          </div>
                        </div>
                        {(errors[ftKey] || errors[inKey]) && (
                          <FieldError message={errors[ftKey]?.message ?? errors[inKey]?.message} />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div style={{ paddingTop: '12px', borderTop: '1px solid #E8E3D8' }}>
                <FieldLabel>Special Instructions</FieldLabel>
                <textarea
                  rows={3}
                  style={{ width: '100%', borderRadius: '4px', border: '1px solid #D0D0D0', padding: '8px 12px', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', minHeight: '80px' }}
                  placeholder="Any special handling or requirements (optional)"
                  {...register('specialRequirements')}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Pay & Terms */}
          <div style={sectionPanelStyle}>
            <SectionTitle emoji="💰">Pay &amp; Terms</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <FieldLabel>Terms</FieldLabel>
                <select className={selectClass} {...register('paymentTerms')} style={{ height: '40px', width: '100%' }}>
                  <option value="">Not specified</option>
                  <option value="IMMEDIATE">Immediate</option>
                  <option value="NET_7">Net 7</option>
                  <option value="NET_14">Net 14</option>
                  <option value="NET_30">Net 30</option>
                </select>
              </div>

              <div>
                <FieldLabel>Pay Rate</FieldLabel>
                <div role="group" aria-label="Pay rate type" style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                  {(['FLAT_RATE', 'PER_MILE'] as const).map((type) => (
                    <button key={type} type="button" role="radio" aria-checked={payRateType === type}
                      onClick={() => setValue('payRateType', type, { shouldValidate: true })}
                      style={{
                        flex: 1, height: '32px', borderRadius: '4px', fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                        border: '1px solid #D0D0D0',
                        background: payRateType === type ? '#B08D57' : '#F8F9FB',
                        color: payRateType === type ? '#FFFFFF' : '#636E72',
                        transition: 'all 0.2s',
                      }}>
                      {type === 'FLAT_RATE' ? 'Flat' : 'Per Mile'}
                    </button>
                  ))}
                </div>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: '#636E72' }}>$</span>
                  <input
                    data-testid="payRate"
                    type="number" step="0.01" min="0.01"
                    style={{ width: '100%', height: '40px', borderRadius: '4px', border: errors.payRate ? '2px solid #E74C3C' : '1px solid #D0D0D0', padding: '8px 8px 8px 28px', fontSize: '13px' }}
                    {...register('payRate', { valueAsNumber: true })}
                  />
                </div>
                <p style={{ fontSize: '12px', color: '#636E72', marginTop: '4px' }}>
                  {payRateType === 'PER_MILE'
                    ? (distanceMiles != null && payRate > 0
                      ? `≈ $${(payRate * distanceMiles).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : 'per mile')
                    : 'flat rate'}
                </p>
                <FieldError message={errors.payRate?.message} />
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: sticky live preview panel (desktop only) ────────────── */}
        <div className="hidden lg:block" style={{ position: 'sticky', top: '88px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Completion meter */}
          <div style={sectionPanelStyle}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#636E72' }}>Form Completion</span>
              <span data-testid="completion-meter"
                style={{ fontFamily: 'Sora, sans-serif', fontSize: '18px', fontWeight: 900, color: completenessColor }}>
                {completeness}%
              </span>
            </div>
            <div style={{ height: '4px', background: '#E8E3D8', borderRadius: '9999px', overflow: 'hidden', marginBottom: '8px' }}>
              <div style={{ height: '100%', width: `${completeness}%`, background: completenessBarColor, borderRadius: '9999px', transition: 'width 400ms ease' }} />
            </div>
            <p style={{ fontSize: '12px', color: '#9C8060' }}>{nudgeText}</p>
          </div>

          {/* Board preview card */}
          <div data-testid="board-preview" style={sectionPanelStyle}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9C8060', marginBottom: '12px' }}>Board Preview</div>
            <div style={{ fontFamily: 'Sora, sans-serif', fontSize: '15px', fontWeight: 700, color: '#1A1A1A', marginBottom: '2px' }}>
              {originCity && originState ? `${originCity}, ${originState}` : '—'}
              {' → '}
              {destinationCity && destinationState ? `${destinationCity}, ${destinationState}` : '—'}
            </div>
            <div style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '12px' }}>
              {equipmentType ? equipmentType.replace('_', ' ') : '—'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
              {[
                { label: 'Distance', value: distanceMiles != null ? `${distanceMiles.toLocaleString()} mi` : '—' },
                { label: 'Weight',   value: typeof weightLbs === 'number' && weightLbs > 0 ? `${weightLbs.toLocaleString()} lbs` : '—' },
                { label: 'Equip',   value: equipmentType ?? '—' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }}>{value}</div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontFamily: 'Sora, sans-serif', fontSize: '18px', fontWeight: 900, color: '#1A1A1A' }}>
                {typeof payRate === 'number' && payRate > 0
                  ? `$${payRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : '—'}
              </span>
              {rpm != null && (
                <span style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid #22C55E', color: '#15803D', borderRadius: '9999px', padding: '2px 8px', fontSize: '11px', fontWeight: 600 }}>
                  ${rpm.toFixed(2)}/mi
                </span>
              )}
            </div>
            {pickupFrom && (
              <div style={{ fontSize: '12px', color: '#636E72', marginTop: '8px' }}>
                Pickup: {new Date(pickupFrom).toLocaleString()}
              </div>
            )}
          </div>

          {/* Tips panel */}
          <div style={{ background: '#FAF6EE', border: '1px solid #E8E3D8', borderRadius: '8px', padding: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9C8060', marginBottom: '8px' }}>Tips for Faster Claims</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {!pickupFrom && <li style={{ fontSize: '12px', color: '#7A5F3A' }}>📅 Add pickup dates to attract more carriers</li>}
              {!(typeof payRate === 'number' && payRate > 0) && <li style={{ fontSize: '12px', color: '#7A5F3A' }}>💰 Set a competitive pay rate for faster bids</li>}
              {!commodity && <li style={{ fontSize: '12px', color: '#7A5F3A' }}>📦 Specify your commodity for better matches</li>}
              {pickupFrom && (typeof payRate === 'number' && payRate > 0) && commodity && <li style={{ fontSize: '12px', color: '#27AE60' }}>✓ Load looks good — ready to publish!</li>}
            </ul>
          </div>
        </div>
      </div>

      {/* Sticky footer */}
      <div style={{
        position: 'sticky', bottom: 0, background: '#FFFFFF',
        borderTop: '1px solid #E8E3D8', padding: '14px 24px',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.06)', zIndex: 10,
        display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'flex-end',
        marginTop: '24px',
      }}>
        {Object.keys(errors).length > 0 && (
          <span style={{ flex: 1, fontSize: '13px', color: '#B91C1C' }}>
            ⚠ Please fix the highlighted fields before publishing.
          </span>
        )}
        {onCancel && (
          <button type="button"
            onClick={() => {
              if (isDirty && !window.confirm('Discard this load? Any changes will be lost.')) return
              onCancel()
            }}
            style={{ height: '44px', padding: '0 24px', borderRadius: '4px', border: '1px solid #E8E3D8', background: 'transparent', color: '#9CA3AF', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            Cancel
          </button>
        )}
        {onSaveDraft && (
          <button type="button" onClick={handleSubmit(onSaveDraft)} disabled={isDraftSaving}
            style={{
              height: '44px', padding: '0 24px', borderRadius: '4px',
              border: '1px solid #C9A876',
              background: 'linear-gradient(180deg, #FAF6EE 0%, #F0E9D8 100%)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 1px 3px rgba(0,0,0,0.15)',
              color: '#7A5F3A', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              opacity: isDraftSaving ? 0.6 : 1,
            }}>
            {isDraftSaving ? 'Saving...' : 'Save as Draft'}
          </button>
        )}
        <button type="submit" data-testid="publish-btn" disabled={publishDisabled}
          style={{
            ...bronzeButtonStyle,
            opacity: publishDisabled ? 0.6 : 1,
          }}
          title={
            completeness < 40 ? 'Add route and schedule to continue'
              : isOverweight && !overweightAcknowledged ? 'Acknowledge the overweight warning to continue'
              : undefined
          }>
          {isSubmitting ? 'Posting...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
