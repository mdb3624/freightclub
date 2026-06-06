import { useMutation, useQueryClient } from '@tanstack/react-query'
import { loadsApi } from '../api'
import { loadQueryInvalidations } from '../utils/queryInvalidation'
import { useToastStore } from '@/store/toastStore'

export function useSettleLoad(loadId: string) {
  const queryClient = useQueryClient()
  const toast = useToastStore((s) => s.show)

  return useMutation({
    mutationFn: () => loadsApi.settle(loadId),
    onSuccess: () => {
      loadQueryInvalidations.onSettle(queryClient, loadId)
      toast('Delivery confirmed. Load settled.', 'success')
    },
  })
}
