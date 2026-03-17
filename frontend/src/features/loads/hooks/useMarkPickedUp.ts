import { useMutation, useQueryClient } from '@tanstack/react-query'
import { loadsApi } from '../api'
import { useToastStore } from '@/store/toastStore'

export function useMarkPickedUp() {
  const queryClient = useQueryClient()
  const toast = useToastStore((s) => s.show)
  return useMutation({
    mutationFn: (id: string) => loadsApi.pickup(id),
    onSuccess: (load) => {
      queryClient.invalidateQueries({ queryKey: ['my-active-load'] })
      queryClient.invalidateQueries({ queryKey: ['board', load.id] })
      toast("Pickup confirmed — you're now in transit.")
    },
  })
}
