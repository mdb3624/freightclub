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
import { Button } from '@/components/ui/Button'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import { PersonalInfoSection } from '@/features/carrier/components/profile/PersonalInfoSection'
import { AddressSection } from '@/features/carrier/components/profile/AddressSection'
import { CostProfileSection } from '@/features/carrier/components/profile/CostProfileSection'
import { NotificationsSection } from '@/features/carrier/components/profile/NotificationsSection'
import type { ApiError } from '@/types'

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

  const { data: profile, isLoading } = useProfile()
  const { mutate, isPending, error, isSuccess } = useUpdateProfile()
  const { data: ratingSummary } = useMyRatingSummary()
  const [saved, setSaved] = useState(false)

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<UpdateProfileValues>({
    resolver: zodResolver(schema),
    defaultValues: { notifyEmail: true, notifySms: false, notifyInApp: true },
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
        <h1 className="text-2xl font-semibold text-gray-900">My Profile</h1>
      </div>

      <form onSubmit={handleSubmit((v) => mutate(v))} className="space-y-8">
        {apiError && <ErrorBanner message={apiError} />}
        {saved && (
          <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
            Profile saved successfully.
          </div>
        )}

        {isTrucker && ratingSummary && (
          <section className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">My Rating</h3>
              <Link to="/ratings" className="text-xs text-primary-600 hover:underline">View history →</Link>
            </div>
            {ratingSummary.avgStars != null ? (
              <div className="flex items-center gap-3">
                <StarRating value={Math.round(ratingSummary.avgStars)} readOnly size="md" />
                <span className="text-lg font-bold text-gray-900">{ratingSummary.avgStars.toFixed(1)}</span>
                <span className="text-sm text-gray-500">
                  ({ratingSummary.totalRatings} rating{ratingSummary.totalRatings !== 1 ? 's' : ''})
                </span>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No ratings yet — complete your first load to start building your reputation.</p>
            )}
          </section>
        )}

        {profile?.companyName && (
          <section className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Company</h3>
            <p className="text-sm text-gray-900 font-medium">{profile.companyName}</p>
            {profile.companyJoinCode && (
              <div className="mt-3 flex items-center gap-3">
                <div className="rounded-md bg-gray-100 px-3 py-2">
                  <p className="text-xs text-gray-500 mb-0.5">Join code</p>
                  <p className="font-mono text-sm font-semibold text-gray-900 tracking-widest">{profile.companyJoinCode}</p>
                </div>
                <p className="text-xs text-gray-500">Share this code with colleagues to add them to your company.</p>
              </div>
            )}
          </section>
        )}

        <PersonalInfoSection register={register} errors={errors} isTrucker={isTrucker} />
        {isTrucker && <CostProfileSection register={register} control={control} />}
        <AddressSection register={register} isTrucker={isTrucker} />
        <NotificationsSection register={register} />

        <div className="flex justify-end">
          <Button type="submit" isLoading={isPending}>Save Changes</Button>
        </div>
      </form>
    </AppShell>
  )
}
