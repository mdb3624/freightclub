import { useMutation, useQueryClient } from '@tanstack/react-query'
import { profileApi } from '../api'
import type { UpdateProfileValues } from '../types'

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateProfileValues) => profileApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}
