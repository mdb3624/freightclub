import { useQuery } from '@tanstack/react-query'
import { loadsApi } from '../api'

export function useLoads(page = 0, size = 20) {
  return useQuery({
    queryKey: ['loads', page, size],
    queryFn: () => loadsApi.list(page, size),
  })
}
