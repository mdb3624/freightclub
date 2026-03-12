import { useQuery } from '@tanstack/react-query'
import { loadsApi } from '../api'

export function useLoad(id: string | undefined) {
  return useQuery({
    queryKey: ['loads', id],
    queryFn: () => loadsApi.getById(id!),
    enabled: !!id,
  })
}
