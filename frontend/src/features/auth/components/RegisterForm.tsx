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

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  role: z.enum(['SHIPPER', 'TRUCKER', 'ADMIN'], { required_error: 'Please select your role' }),
  companyName: z.string().min(1, 'Company name is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export function RegisterForm() {
  const { mutate, isPending, error } = useRegister()

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(schema),
  })

  const selectedRole = watch('role')

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

      <Input
        label="Company name"
        autoComplete="organization"
        error={errors.companyName?.message}
        placeholder="e.g. Acme Logistics LLC"
        {...register('companyName')}
      />

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
