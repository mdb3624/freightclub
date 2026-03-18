import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { loadsApi } from '../api'

export function useCreateDraft() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: loadsApi.createDraft,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loads'] })
      navigate('/dashboard/shipper')
    },
  })
}
