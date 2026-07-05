import { useQuery } from '@tanstack/react-query'
import { loadsApi } from '../api'

export function usePaymentStatus(loadId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ['payment-status', loadId],
    queryFn: () => loadsApi.getPaymentStatus(loadId!),
    enabled: !!loadId && enabled,
  })
}
