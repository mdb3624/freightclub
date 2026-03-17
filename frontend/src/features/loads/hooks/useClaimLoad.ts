import { useMutation, useQueryClient } from '@tanstack/react-query'
import { loadsApi } from '../api'
import { useToastStore } from '@/store/toastStore'

export function useClaimLoad() {
  const queryClient = useQueryClient()
  const toast = useToastStore((s) => s.show)
  return useMutation({
    mutationFn: (id: string) => loadsApi.claim(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board'] })
      queryClient.invalidateQueries({ queryKey: ['my-active-load'] })
      toast('Load claimed! Head to your dashboard to get started.')
    },
    onError: () => {
      toast('Failed to claim load.', 'error')
    },
  })
}
