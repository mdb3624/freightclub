import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api'
import { useAuthStore } from '@/store/authStore'
import type { RegisterFormValues } from '../types'

export function useRegister() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation({
    mutationFn: ({ confirmPassword: _, ...data }: RegisterFormValues) =>
      authApi.register({
        ...data,
        equipmentType: data.equipmentType || undefined,
      }),
    onSuccess: (response) => {
      setAuth(response.accessToken, response.user)
      const destination = response.user.role === 'SHIPPER'
        ? '/dashboard/shipper'
        : '/dashboard/trucker'
      navigate(destination, { replace: true })
    },
  })
}
