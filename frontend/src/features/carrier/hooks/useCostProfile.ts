import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { costProfileApi } from '../costProfileApi'
import type { CostProfileWizardFormData } from '../schemas/costProfile.schemas'

export function useCostProfile() {
  return useQuery({
    queryKey: ['cost-profile'],
    queryFn: costProfileApi.get,
  })
}

export function useSaveCostProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CostProfileWizardFormData) => costProfileApi.save(data),
    onSuccess: (data) => {
      queryClient.setQueryData(['cost-profile'], data)
      // US-730a-v2 AC: load board RPM badges must refresh after a cost profile save
      queryClient.invalidateQueries({ queryKey: ['loads'] })
    },
  })
}
