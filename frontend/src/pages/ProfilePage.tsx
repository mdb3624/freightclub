import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { AxiosError } from 'axios'
import { useProfile } from '@/features/profile/hooks/useProfile'
import { useUpdateProfile } from '@/features/profile/hooks/useUpdateProfile'
import type { UpdateProfileValues } from '@/features/profile/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import type { ApiError } from '@/types'

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  businessName: z.string().optional().default(''),
  phone: z.string().max(20).optional().default(''),
  billingAddress: z.string().optional().default(''),
  billingCity: z.string().optional().default(''),
  billingState: z.string().optional().default(''),
  billingZip: z.string().max(10).optional().default(''),
  defaultPickupAddress: z.string().optional().default(''),
  defaultPickupCity: z.string().optional().default(''),
  defaultPickupState: z.string().optional().default(''),
  defaultPickupZip: z.string().max(10).optional().default(''),
  notifyEmail: z.boolean(),
  notifySms: z.boolean(),
  notifyInApp: z.boolean(),
})

export function ProfilePage() {
  const { data: profile, isLoading } = useProfile()
  const { mutate, isPending, error, isSuccess } = useUpdateProfile()
  const [saved, setSaved] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<UpdateProfileValues>({
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
        billingAddress: profile.billingAddress ?? '',
        billingCity: profile.billingCity ?? '',
        billingState: profile.billingState ?? '',
        billingZip: profile.billingZip ?? '',
        defaultPickupAddress: profile.defaultPickupAddress ?? '',
        defaultPickupCity: profile.defaultPickupCity ?? '',
        defaultPickupState: profile.defaultPickupState ?? '',
        defaultPickupZip: profile.defaultPickupZip ?? '',
        notifyEmail: profile.notifyEmail,
        notifySms: profile.notifySms,
        notifyInApp: profile.notifyInApp,
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

  if (isLoading) return <p className="text-center text-gray-500 py-12">Loading...</p>

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-xl font-bold text-gray-900">FreightClub</h1>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        <div className="mb-6">
          <Link to="/dashboard/shipper" className="text-sm text-primary-600 hover:underline">
            ← Back to Dashboard
          </Link>
          <h2 className="mt-2 text-2xl font-semibold text-gray-900">My Profile</h2>
        </div>

        <form onSubmit={handleSubmit((v) => mutate(v))} className="space-y-8">
          {apiError && <ErrorBanner message={apiError} />}
          {saved && (
            <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
              Profile saved successfully.
            </div>
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

          {/* Billing Address */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Billing Address</h3>
            <Input label="Street Address" placeholder="e.g. 123 Main St" {...register('billingAddress')} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input label="City" {...register('billingCity')} />
              <Input label="State" {...register('billingState')} />
              <Input label="Zip Code" maxLength={10} {...register('billingZip')} />
            </div>
          </section>

          {/* Default Pickup Location */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Default Pickup Location</h3>
            <p className="text-xs text-gray-500">Pre-fills the origin address when posting a new load.</p>
            <Input label="Street Address" placeholder="e.g. 456 Warehouse Dr" {...register('defaultPickupAddress')} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input label="City" {...register('defaultPickupCity')} />
              <Input label="State" {...register('defaultPickupState')} />
              <Input label="Zip Code" maxLength={10} {...register('defaultPickupZip')} />
            </div>
          </section>

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
      </main>
    </div>
  )
}
