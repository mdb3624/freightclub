import { useQuery } from '@tanstack/react-query'
import { loadsApi } from '../api'

export function useMyLoadHistory(page = 0) {
  return useQuery({
    queryKey: ['my-load-history', page],
    queryFn: () => loadsApi.getMyLoadHistory(page),
  })
}
