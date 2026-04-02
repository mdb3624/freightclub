import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { loadsApi } from '../api'

export function useLoadEvents(loadId: string) {
  const role = useAuthStore((s) => s.user?.role)

  return useQuery({
    queryKey: ['load-events', loadId],
    queryFn: () =>
      role === 'TRUCKER'
        ? loadsApi.getBoardEvents(loadId)
        : loadsApi.getEvents(loadId),
    enabled: !!loadId,
  })
}
