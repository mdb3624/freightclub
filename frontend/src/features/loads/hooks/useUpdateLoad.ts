import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { loadsApi } from '../api'
import type { LoadFormValues } from '../types'

export function useUpdateLoad(id: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: LoadFormValues) => loadsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loads'] })
      queryClient.invalidateQueries({ queryKey: ['loads', id] })
      navigate(`/shipper/loads/${id}`)
    },
  })
}
