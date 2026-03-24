import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { documentsApi } from '../api'
import { useToastStore } from '@/store/toastStore'

export function useLoadDocuments(loadId: string | undefined) {
  return useQuery({
    queryKey: ['documents', loadId],
    queryFn: () => documentsApi.list(loadId!),
    enabled: !!loadId,
  })
}

export function useUploadBolPhoto(loadId: string) {
  const queryClient = useQueryClient()
  const toast = useToastStore()
  return useMutation({
    mutationFn: (file: File) => documentsApi.uploadBolPhoto(loadId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', loadId] })
      toast.show('BOL photo uploaded.')
    },
  })
}

export function useUploadPodPhoto(loadId: string) {
  const queryClient = useQueryClient()
  const toast = useToastStore()
  return useMutation({
    mutationFn: (file: File) => documentsApi.uploadPodPhoto(loadId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', loadId] })
      toast.show('POD photo uploaded.')
    },
  })
}

export function useReportIssue(loadId: string) {
  const queryClient = useQueryClient()
  const toast = useToastStore()
  return useMutation({
    mutationFn: ({ description, photo }: { description: string; photo?: File }) =>
      documentsApi.reportIssue(loadId, description, photo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', loadId] })
      toast.show('Issue reported.')
    },
  })
}
