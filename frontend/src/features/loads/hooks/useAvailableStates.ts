import { useQuery } from '@tanstack/react-query'
import { loadsApi } from '../api'

export function useAvailableStates() {
  return useQuery({
    queryKey: ['board', 'available-states'],
    queryFn: () => loadsApi.getAvailableStates(),
    staleTime: 30_000,
  })
}
