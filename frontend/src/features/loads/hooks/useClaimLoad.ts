import { useMutation, useQueryClient } from '@tanstack/react-query'
import { loadsApi } from '../api'
import { loadQueryInvalidations } from '../utils/queryInvalidation'
import { useToastStore } from '@/store/toastStore'

export function useClaimLoad() {
  const queryClient = useQueryClient()
  const toast = useToastStore((s) => s.show)
  return useMutation({
    mutationFn: (id: string) => loadsApi.claim(id),
    onSuccess: () => {
      loadQueryInvalidations.onClaim(queryClient)
      toast('Load claimed! Head to your dashboard to get started.')
    },
    onError: () => {
      toast('Failed to claim load.', 'error')
    },
  })
}
