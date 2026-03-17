import { useMutation, useQueryClient } from '@tanstack/react-query'
import { loadsApi } from '../api'
import { useToastStore } from '@/store/toastStore'

export function useMarkDelivered() {
  const queryClient = useQueryClient()
  const toast = useToastStore((s) => s.show)
  return useMutation({
    mutationFn: (id: string) => loadsApi.deliver(id),
    onSuccess: (load) => {
      queryClient.invalidateQueries({ queryKey: ['my-active-load'] })
      queryClient.invalidateQueries({ queryKey: ['board', load.id] })
      queryClient.invalidateQueries({ queryKey: ['my-load-history'] })
      toast('Delivery confirmed — great work!')
    },
  })
}
