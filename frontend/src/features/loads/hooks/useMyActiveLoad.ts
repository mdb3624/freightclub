import { useQuery } from '@tanstack/react-query'
import { loadsApi } from '../api'

export function useMyActiveLoad() {
  return useQuery({
    queryKey: ['my-active-load'],
    queryFn: () => loadsApi.getMyActiveLoad(),
  })
}
