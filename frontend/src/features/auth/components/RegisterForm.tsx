import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { useRegister } from '../hooks/useRegister'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import type { RegisterFormValues } from '../types'
import type { AxiosError } from 'axios'
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
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  role: z.enum(['SHIPPER', 'TRUCKER', 'ADMIN'], { required_error: 'Please select your role' }),
  companyName: z.string().optional().default(''),
  joinCode: z.string().optional().default(''),
  mcNumber: z.string().max(20).optional().default(''),
  dotNumber: z.string().max(20).optional().default(''),
  equipmentType: z.enum(['DRY_VAN', 'FLATBED', 'REEFER', 'STEP_DECK', '']).optional().default(''),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export function RegisterForm() {
  const { mutate, isPending, error } = useRegister()
  const [joining, setJoining] = useState(false)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { companyName: '', joinCode: '', mcNumber: '', dotNumber: '', equipmentType: '' },
  })

  const selectedRole = watch('role')
  const isTrucker = selectedRole === 'TRUCKER'

  const apiErrorMessage = error
    ? ((error as AxiosError<ApiError>).response?.data?.message ?? 'Registration failed. Please try again.')
    : null

  return (
    <form onSubmit={handleSubmit((data) => mutate(data))} className="flex flex-col gap-4" noValidate>
      {apiErrorMessage && <ErrorBanner message={apiErrorMessage} />}

      {/* Role selection */}
      <div>
        <p className="mb-2 text-sm font-medium text-gray-700">I am a...</p>
        <div className="grid grid-cols-3 gap-3">
          {([
            { value: 'SHIPPER', label: 'Shipper', description: 'I need freight transported' },
            { value: 'TRUCKER', label: 'Trucker', description: 'I haul loads' },
            { value: 'ADMIN',   label: 'Admin',   description: 'Platform administrator' },
          ] as const).map(({ value, label, description }) => (
            <button
              key={value}
              type="button"
              onClick={() => setValue('role', value, { shouldValidate: true })}
              className={`rounded-lg border-2 p-4 text-left transition-colors ${
                selectedRole === value
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="font-medium text-gray-900">{label}</p>
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            </button>
          ))}
        </div>
        {errors.role && (
          <p role="alert" className="mt-1 text-xs text-red-600">{errors.role.message}</p>
        )}
        <input type="hidden" {...register('role')} />
      </div>

      {/* Company: create or join toggle */}
      <div className="rounded-lg border border-gray-200 p-4 space-y-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setJoining(false)}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              !joining ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Create company
          </button>
          <button
            type="button"
            onClick={() => setJoining(true)}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              joining ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Join existing
          </button>
        </div>

        {!joining ? (
          <Input
            label="Company name"
            autoComplete="organization"
            error={errors.companyName?.message}
            placeholder="e.g. Acme Logistics LLC"
            {...register('companyName')}
          />
        ) : (
          <Input
            label="Company join code"
            error={errors.joinCode?.message}
            placeholder="e.g. AB3K7PQR"
            {...register('joinCode')}
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="First name"
          autoComplete="given-name"
          error={errors.firstName?.message}
          {...register('firstName')}
        />
        <Input
          label="Last name"
          autoComplete="family-name"
          error={errors.lastName?.message}
          {...register('lastName')}
        />
      </div>

      <Input
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        label="Password"
        type="password"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register('password')}
      />

      <Input
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      {/* Trucker-specific fields */}
      {isTrucker && (
        <div className="rounded-lg border border-gray-200 p-4 space-y-3">
          <p className="text-sm font-medium text-gray-700">Carrier Information</p>
          <div className="grid grid-cols-2 gap-3">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primary Equipment
            </label>
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              {...register('equipmentType')}
            >
              <option value="">Select equipment type</option>
              {EQUIPMENT_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            {errors.equipmentType && (
              <p role="alert" className="mt-1 text-xs text-red-600">{errors.equipmentType.message}</p>
            )}
          </div>
        </div>
      )}

      <Button type="submit" isLoading={isPending} className="w-full mt-2">
        Create account
      </Button>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
          Sign in
        </Link>
      </p>
    </form>
  )
}
