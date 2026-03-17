import { useQuery } from '@tanstack/react-query'
import { loadsApi } from '../api'

export function useLoadBoard(page = 0, size = 20) {
  return useQuery({
    queryKey: ['board', page, size],
    queryFn: () => loadsApi.listOpen(page, size),
  })
}
