import { useMutation, useQueryClient } from '@tanstack/react-query'
import { loadsApi } from '../api'

export function useCancelLoad() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { loadId: string; reason?: string }) =>
      loadsApi.cancel(data.loadId, data.reason || 'Cancelled by shipper'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipmentStatus'] })
      queryClient.invalidateQueries({ queryKey: ['shipper-loads'] })
    },
  })
}
