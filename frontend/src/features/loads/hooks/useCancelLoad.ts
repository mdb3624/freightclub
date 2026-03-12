import { useMutation, useQueryClient } from '@tanstack/react-query'
import { loadsApi } from '../api'

export function useCancelLoad() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => loadsApi.cancel(id),
    onSuccess: (_load, id) => {
      queryClient.invalidateQueries({ queryKey: ['loads'] })
      queryClient.invalidateQueries({ queryKey: ['loads', id] })
    },
  })
}
