import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { loadsApi } from '../api'

export function useCancelLoad() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (id: string) => loadsApi.cancel(id),
    onSuccess: (_load, id) => {
      queryClient.invalidateQueries({ queryKey: ['loads'] })
      queryClient.invalidateQueries({ queryKey: ['loads', id] })
      navigate('/dashboard/shipper')
    },
  })
}
