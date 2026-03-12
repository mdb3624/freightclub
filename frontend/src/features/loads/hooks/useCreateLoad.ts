import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { loadsApi } from '../api'

export function useCreateLoad() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: loadsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loads'] })
      navigate('/dashboard/shipper')
    },
  })
}
