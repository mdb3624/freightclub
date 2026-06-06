import { useMutation, useQueryClient } from '@tanstack/react-query'
import { loadsApi } from '../api'
import { loadQueryInvalidations } from '../utils/queryInvalidation'
import { useToastStore } from '@/store/toastStore'

export function useDisputeLoad(loadId: string) {
  const queryClient = useQueryClient()
  const toast = useToastStore((s) => s.show)

  return useMutation({
    mutationFn: (reason: string) => loadsApi.dispute(loadId, reason),
    onSuccess: () => {
      loadQueryInvalidations.onDispute(queryClient, loadId)
      toast('Dispute filed. Our team will review.', 'info')
    },
  })
}
