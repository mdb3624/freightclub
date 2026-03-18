import { useQuery } from '@tanstack/react-query'
import { loadsApi } from '../api'
import type { BoardFilter } from '../types'

export function useLoadBoard(page = 0, filter: BoardFilter = {}, size = 20) {
  return useQuery({
    queryKey: ['board', page, size, filter],
    queryFn: () => loadsApi.listOpen(page, size, filter),
  })
}
