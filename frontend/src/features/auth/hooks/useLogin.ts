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
      // US-750: ADMIN (Super User) lands on its own platform-wide surface, never a persona
      // dashboard — there is no tenant for this role to have a dashboard for.
      const destination =
        response.user.role === 'ADMIN' ? '/super-user'
        : response.user.role === 'SHIPPER' ? '/dashboard/shipper'
        : '/dashboard/trucker'
      navigate(destination, { replace: true })
    },
  })
}
