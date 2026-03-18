import { useMutation, useQueryClient } from '@tanstack/react-query'
import { loadsApi } from '../api'

export function usePublishLoad() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => loadsApi.publish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loads'] })
    },
  })
}
