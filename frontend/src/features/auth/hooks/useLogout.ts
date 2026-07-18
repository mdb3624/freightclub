import { useNavigate } from 'react-router-dom'
import { authApi } from '../api'
import { useAuthStore } from '@/store/authStore'
import { queryClient } from '@/lib/queryClient'

export function useLogout() {
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)

  return () => {
    logout()
    queryClient.clear()
    navigate('/', { replace: true })
    authApi.logout().catch(() => {})
  }
}
