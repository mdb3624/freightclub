import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { useLogin } from '../hooks/useLogin'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import type { LoginFormValues } from '../types'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types'

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

export function LoginForm() {
  const { mutate, isPending, error } = useLogin()

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
  })

  const apiErrorMessage = error
    ? ((error as AxiosError<ApiError>).response?.data?.message ?? 'Login failed. Please try again.')
    : null

  return (
    <form onSubmit={handleSubmit((data) => mutate(data))} className="flex flex-col gap-4" noValidate>
      {apiErrorMessage && <ErrorBanner message={apiErrorMessage} />}

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
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />

      <Button type="submit" isLoading={isPending} className="w-full mt-2">
        Sign in
      </Button>

      <p className="text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-primary-600 hover:text-primary-700">
          Sign up
        </Link>
      </p>
    </form>
  )
}
