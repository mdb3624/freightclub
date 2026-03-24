import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '@/components/AppShell'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { AxiosError } from 'axios'
import { useAuthStore } from '@/store/authStore'
import { useProfile } from '@/features/profile/hooks/useProfile'
import { useUpdateProfile } from '@/features/profile/hooks/useUpdateProfile'
import type { UpdateProfileValues } from '@/features/profile/types'
import { useMyRatingSummary } from '@/features/ratings/hooks/useRatings'
import { StarRating } from '@/features/ratings/components/StarRating'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import type { ApiError } from '@/types'

const EQUIPMENT_OPTIONS = [
  { value: 'DRY_VAN',   label: 'Dry Van' },
  { value: 'FLATBED',   label: 'Flatbed' },
  { value: 'REEFER',    label: 'Reefer' },
  { value: 'STEP_DECK', label: 'Step Deck' },
] as const

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  businessName: z.string().optional().default(''),
  phone: z.string().max(20).optional().default(''),
  billingAddress1: z.string().optional().default(''),
  billingAddress2: z.string().optional().default(''),
  billingCity: z.string().optional().default(''),
  billingState: z.string().optional().default(''),
  billingZip: z.string().max(10).optional().default(''),
  defaultPickupAddress1: z.string().optional().default(''),
  defaultPickupAddress2: z.string().optional().default(''),
  defaultPickupCity: z.string().optional().default(''),
  defaultPickupState: z.string().optional().default(''),
  defaultPickupZip: z.string().max(10).optional().default(''),
  notifyEmail: z.boolean(),
  notifySms: z.boolean(),
  notifyInApp: z.boolean(),
  mcNumber: z.string().max(20).optional().default(''),
  dotNumber: z.string().max(20).optional().default(''),
  equipmentType: z.enum(['DRY_VAN', 'FLATBED', 'REEFER', 'STEP_DECK', '']).optional().default(''),
  monthlyFixedCosts:      z.preprocess((v) => v === '' ? undefined : Number(v), z.number().positive().optional()),
  fuelCostPerGallon:      z.preprocess((v) => v === '' ? undefined : Number(v), z.number().positive().optional()),
  milesPerGallon:         z.preprocess((v) => v === '' ? undefined : Number(v), z.number().positive().optional()),
  maintenanceCostPerMile: z.preprocess((v) => v === '' ? undefined : Number(v), z.number().min(0).optional()),
  monthlyMilesTarget:     z.preprocess((v) => v === '' ? undefined : Number(v), z.number().int().positive().optional()),
  targetMarginPerMile:    z.preprocess((v) => v === '' ? undefined : Number(v), z.number().min(0).optional()),
})

export function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const isTrucker = user?.role === 'TRUCKER'
  const dashboardPath = isTrucker ? '/dashboard/trucker' : '/dashboard/shipper'

  const { data: profile, isLoading } = useProfile()
  const { mutate, isPending, error, isSuccess } = useUpdateProfile()
  const { data: ratingSummary } = useMyRatingSummary()
  const [saved, setSaved] = useState(false)

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<UpdateProfileValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      notifyEmail: true,
      notifySms: false,
      notifyInApp: true,
    },
  })

  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        businessName: profile.businessName ?? '',
        phone: profile.phone ?? '',
        billingAddress1: profile.billingAddress1 ?? '',
        billingAddress2: profile.billingAddress2 ?? '',
        billingCity: profile.billingCity ?? '',
        billingState: profile.billingState ?? '',
        billingZip: profile.billingZip ?? '',
        defaultPickupAddress1: profile.defaultPickupAddress1 ?? '',
        defaultPickupAddress2: profile.defaultPickupAddress2 ?? '',
        defaultPickupCity: profile.defaultPickupCity ?? '',
        defaultPickupState: profile.defaultPickupState ?? '',
        defaultPickupZip: profile.defaultPickupZip ?? '',
        notifyEmail: profile.notifyEmail,
        notifySms: profile.notifySms,
        notifyInApp: profile.notifyInApp,
        mcNumber: profile.mcNumber ?? '',
        dotNumber: profile.dotNumber ?? '',
        equipmentType: profile.equipmentType ?? '',
        monthlyFixedCosts:      profile.monthlyFixedCosts      ?? '',
        fuelCostPerGallon:      profile.fuelCostPerGallon      ?? '',
        milesPerGallon:         profile.milesPerGallon         ?? '',
        maintenanceCostPerMile: profile.maintenanceCostPerMile ?? '',
        monthlyMilesTarget:     profile.monthlyMilesTarget     ?? '',
        targetMarginPerMile:    profile.targetMarginPerMile    ?? '',
      })
    }
  }, [profile, reset])

  useEffect(() => {
    if (isSuccess) {
      setSaved(true)
      const t = setTimeout(() => setSaved(false), 3000)
      return () => clearTimeout(t)
    }
  }, [isSuccess])

  const apiError = error
    ? ((error as AxiosError<ApiError>).response?.data?.message ?? 'Failed to save profile')
    : null

  if (isLoading) return <AppShell maxWidth="lg"><p className="text-center text-gray-500 py-12">Loading...</p></AppShell>

  return (
    <AppShell maxWidth="lg">
      <div className="mb-6">
        <Link to={dashboardPath} className="text-sm text-primary-600 hover:underline">
          ← Back to Dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900">My Profile</h1>
      </div>

        <form onSubmit={handleSubmit((v) => mutate(v))} className="space-y-8">
          {apiError && <ErrorBanner message={apiError} />}
          {saved && (
            <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
              Profile saved successfully.
            </div>
          )}

          {/* Trucker: Rating Summary */}
          {isTrucker && ratingSummary && (
            <section className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">My Rating</h3>
                <Link to="/ratings" className="text-xs text-primary-600 hover:underline">
                  View history →
                </Link>
              </div>
              {ratingSummary.avgStars != null ? (
                <div className="flex items-center gap-3">
                  <StarRating value={Math.round(ratingSummary.avgStars)} readOnly size="md" />
                  <span className="text-lg font-bold text-gray-900">
                    {ratingSummary.avgStars.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({ratingSummary.totalRatings} rating{ratingSummary.totalRatings !== 1 ? 's' : ''})
                  </span>
                </div>
              ) : (
                <p className="text-sm text-gray-400">No ratings yet — complete your first load to start building your reputation.</p>
              )}
            </section>
          )}

          {/* Company (read-only) */}
          {profile?.companyName && (
            <section className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Company</h3>
              <p className="text-sm text-gray-900 font-medium">{profile.companyName}</p>
              {profile.companyJoinCode && (
                <div className="mt-3 flex items-center gap-3">
                  <div className="rounded-md bg-gray-100 px-3 py-2">
                    <p className="text-xs text-gray-500 mb-0.5">Join code</p>
                    <p className="font-mono text-sm font-semibold text-gray-900 tracking-widest">
                      {profile.companyJoinCode}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">Share this code with colleagues to add them to your company.</p>
                </div>
              )}
            </section>
          )}

          {/* Personal Info */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Personal Information</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="First Name" error={errors.firstName?.message} {...register('firstName')} />
              <Input label="Last Name" error={errors.lastName?.message} {...register('lastName')} />
            </div>
            <Input label="Business Name" placeholder="Optional" {...register('businessName')} />
            <Input label="Phone" type="tel" placeholder="e.g. 555-123-4567" maxLength={20} {...register('phone')} />
          </section>

          {/* Trucker: Carrier Information */}
          {isTrucker && (
            <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Carrier Information</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="MC Number"
                  placeholder="e.g. MC-123456"
                  maxLength={20}
                  error={errors.mcNumber?.message}
                  {...register('mcNumber')}
                />
                <Input
                  label="DOT Number"
                  placeholder="e.g. 1234567"
                  maxLength={20}
                  error={errors.dotNumber?.message}
                  {...register('dotNumber')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Equipment</label>
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  {...register('equipmentType')}
                >
                  <option value="">Select equipment type</option>
                  {EQUIPMENT_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </section>
          )}

          {/* Trucker: Cost Profile */}
          {isTrucker && (
            <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Cost Profile</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Used to calculate load profitability and your minimum RPM. All fields optional.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Monthly Fixed Costs ($)"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g. 3500 (truck payment + insurance + permits)"
                  {...register('monthlyFixedCosts')}
                />
                <Input
                  label="Monthly Miles Target"
                  type="number"
                  min="1"
                  placeholder="e.g. 10000"
                  {...register('monthlyMilesTarget')}
                />
                <Input
                  label="Fuel Cost per Gallon ($)"
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="e.g. 3.799"
                  {...register('fuelCostPerGallon')}
                />
                <Input
                  label="Miles per Gallon (MPG)"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="e.g. 6.5"
                  {...register('milesPerGallon')}
                />
                <Input
                  label="Maintenance Cost per Mile ($)"
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="e.g. 0.15"
                  {...register('maintenanceCostPerMile')}
                />
                <Input
                  label="Target Profit Margin per Mile ($)"
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="e.g. 0.50"
                  {...register('targetMarginPerMile')}
                />
              </div>
              <CostProfileSummary values={watch()} />
            </section>
          )}

          {/* Billing Address */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Billing Address</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input label="City" {...register('billingCity')} />
              <Input label="State" {...register('billingState')} />
              <Input label="Zip Code" maxLength={10} {...register('billingZip')} />
            </div>
            <Input label="Street Address" placeholder="e.g. 123 Main St" {...register('billingAddress1')} />
            <Input label="Suite / Unit" placeholder="Suite, unit, building (optional)" {...register('billingAddress2')} />
          </section>

          {/* Default Pickup Location (shippers only) */}
          {!isTrucker && (
            <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Default Pickup Location</h3>
              <p className="text-xs text-gray-500">Pre-fills the origin address when posting a new load.</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Input label="City" {...register('defaultPickupCity')} />
                <Input label="State" {...register('defaultPickupState')} />
                <Input label="Zip Code" maxLength={10} {...register('defaultPickupZip')} />
              </div>
              <Input label="Street Address" placeholder="e.g. 456 Warehouse Dr" {...register('defaultPickupAddress1')} />
              <Input label="Suite / Unit" placeholder="Suite, unit, building (optional)" {...register('defaultPickupAddress2')} />
            </section>
          )}

          {/* Notification Preferences */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Notification Preferences</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" {...register('notifyEmail')} />
                <span className="text-sm text-gray-700">Email notifications</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" {...register('notifySms')} />
                <span className="text-sm text-gray-700">SMS notifications</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" {...register('notifyInApp')} />
                <span className="text-sm text-gray-700">In-app notifications</span>
              </label>
            </div>
          </section>

          <div className="flex justify-end">
            <Button type="submit" isLoading={isPending}>Save Changes</Button>
          </div>
        </form>
    </AppShell>
  )
}

function CostProfileSummary({ values }: { values: UpdateProfileValues }) {
  const monthly = Number(values.monthlyFixedCosts) || 0
  const milesTarget = Number(values.monthlyMilesTarget) || 0
  const fuelPerGallon = Number(values.fuelCostPerGallon) || 0
  const mpg = Number(values.milesPerGallon) || 0
  const maintPerMile = Number(values.maintenanceCostPerMile) || 0
  const marginPerMile = Number(values.targetMarginPerMile) || 0

  if (milesTarget <= 0) return null

  const fixedCpm = monthly / milesTarget
  const fuelCpm = mpg > 0 ? fuelPerGallon / mpg : 0
  const variableCpm = fuelCpm + maintPerMile
  const totalCpm = fixedCpm + variableCpm
  const minRpm = totalCpm + marginPerMile

  return (
    <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Calculated Cost Breakdown
      </p>
      <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
        <span className="text-gray-600">Fixed CPM</span>
        <span className="font-mono text-gray-900">${fixedCpm.toFixed(4)}/mi</span>
        <span className="text-gray-600">Variable CPM (fuel + maint.)</span>
        <span className="font-mono text-gray-900">${variableCpm.toFixed(4)}/mi</span>
        <span className="text-gray-700 font-semibold">Total CPM</span>
        <span className="font-mono font-semibold text-gray-900">${totalCpm.toFixed(4)}/mi</span>
        <span className="text-primary-700 font-semibold">Minimum RPM</span>
        <span className="font-mono font-semibold text-primary-700">${minRpm.toFixed(4)}/mi</span>
      </div>
    </div>
  )
}
