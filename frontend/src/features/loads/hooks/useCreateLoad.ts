import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { loadsApi } from '../api'

interface UseCreateLoadOptions {
  onSuccess?: (data: any) => void
}

export function useCreateLoad(options?: UseCreateLoadOptions) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: loadsApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['shipper-loads-stats'] })
      queryClient.invalidateQueries({ queryKey: ['shipper-loads'] })
      queryClient.invalidateQueries({ queryKey: ['shipmentStatus'] })
      if (options?.onSuccess) {
        options.onSuccess(data)
      } else {
        navigate('/dashboard/shipper')
      }
    },
  })
}
