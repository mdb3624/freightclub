import { useNavigate } from 'react-router-dom'
import { authApi } from '../api'
import { useAuthStore } from '@/store/authStore'

export function useLogout() {
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)

  return () => {
    logout()
    navigate('/login', { replace: true })
    authApi.logout().catch(() => {})
  }
}
