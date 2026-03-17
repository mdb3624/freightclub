import { useQuery } from '@tanstack/react-query'
import { loadsApi } from '../api'

export function useBoardLoad(id: string | undefined) {
  return useQuery({
    queryKey: ['board', id],
    queryFn: () => loadsApi.getBoardLoad(id!),
    enabled: !!id,
  })
}
