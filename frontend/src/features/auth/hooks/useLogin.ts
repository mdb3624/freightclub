import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api'
import { useAuthStore } from '@/store/authStore'
import type { LoginFormValues } from '../types'

export function useLogin() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation({
    mutationFn: (data: LoginFormValues) => authApi.login(data),
    onSuccess: (response) => {
      setAuth(response.accessToken, response.user)
      const destination = response.user.role === 'SHIPPER'
        ? '/dashboard/shipper'
        : '/dashboard/trucker'
      navigate(destination, { replace: true })
    },
  })
}
