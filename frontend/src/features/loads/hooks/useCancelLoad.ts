import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { loadsApi } from '../api'
import { loadQueryInvalidations } from '../utils/queryInvalidation'
import { useToastStore } from '@/store/toastStore'

export function useCancelLoad() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const toast = useToastStore((s) => s.show)

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      loadsApi.cancel(id, reason),
    onSuccess: () => {
      loadQueryInvalidations.onCancel(queryClient)
      toast('Load cancelled.', 'info')
      navigate('/dashboard/shipper')
    },
  })
}
