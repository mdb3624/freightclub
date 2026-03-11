import { useNavigate } from 'react-router-dom'
import { authApi } from '../api'
import { useAuthStore } from '@/store/authStore'

export function useLogout() {
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)

  return () => {
    authApi.logout().finally(() => {
      logout()
      navigate('/login', { replace: true })
    })
  }
}
