import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/apiClient'

export function useLoadCounts() {
  return useQuery({
    queryKey: ['load-counts'],
    queryFn: () =>
      apiClient.get<Record<string, number>>('/loads/counts').then((r) => r.data),
  })
}
