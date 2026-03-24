import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ratingsApi } from '../api'
import { useToastStore } from '@/store/toastStore'

export function useMyRatingSummary() {
  return useQuery({
    queryKey: ['ratings', 'my-summary'],
    queryFn: ratingsApi.getMySummary,
  })
}

export function useMyRatingForLoad(loadId: string | undefined) {
  return useQuery({
    queryKey: ['ratings', 'load', loadId, 'mine'],
    queryFn: () => ratingsApi.getMyRating(loadId!),
    enabled: !!loadId,
  })
}

export function useMyReceivedRatings(page = 0, size = 20) {
  return useQuery({
    queryKey: ['ratings', 'my-received', page, size],
    queryFn: () => ratingsApi.getMyReceived(page, size),
  })
}

export function useShipperPublicProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['ratings', 'shipper', userId, 'profile'],
    queryFn: () => ratingsApi.getShipperProfile(userId!),
    enabled: !!userId,
  })
}

export function useRateTrucker(loadId: string) {
  const queryClient = useQueryClient()
  const toast = useToastStore()
  return useMutation({
    mutationFn: ({ stars, comment }: { stars: number; comment?: string }) =>
      ratingsApi.rateTrucker(loadId, stars, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratings', 'load', loadId, 'mine'] })
      toast.show('Rating submitted.')
    },
  })
}

export function useRateShipper(loadId: string) {
  const queryClient = useQueryClient()
  const toast = useToastStore()
  return useMutation({
    mutationFn: ({ stars, comment }: { stars: number; comment?: string }) =>
      ratingsApi.rateShipper(loadId, stars, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratings', 'load', loadId, 'mine'] })
      toast.show('Rating submitted.')
    },
  })
}
