import { useMutation, useQueryClient } from '@tanstack/react-query'
import { loadsApi } from '../api'
import { loadQueryInvalidations } from '../utils/queryInvalidation'
import { useToastStore } from '@/store/toastStore'

export function useMarkDelivered() {
  const queryClient = useQueryClient()
  const toast = useToastStore((s) => s.show)
  return useMutation({
    mutationFn: (id: string) => loadsApi.deliver(id),
    onSuccess: (load) => {
      loadQueryInvalidations.onDelivery(queryClient, load.id)
      toast('Delivery confirmed — great work!')
    },
  })
}
