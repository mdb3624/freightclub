import { useQuery } from '@tanstack/react-query'
import { loadsApi } from '../api'

export function useLoadCounts() {
  return useQuery({
    queryKey: ['load-counts'],
    queryFn: loadsApi.getCounts,
  })
}
