import { useQuery } from '@tanstack/react-query'
import { marketApi } from '../api'

const SIX_HOURS_MS = 6 * 60 * 60 * 1000

export function useDieselPrices() {
  return useQuery({
    queryKey: ['diesel-prices'],
    queryFn: marketApi.getDieselPrices,
    staleTime: SIX_HOURS_MS,
    refetchInterval: SIX_HOURS_MS,
  })
}
