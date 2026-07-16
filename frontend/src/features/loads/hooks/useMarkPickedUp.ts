import { useMutation, useQueryClient } from '@tanstack/react-query'
import { loadsApi } from '../api'
import { loadQueryInvalidations } from '../utils/queryInvalidation'
import { useToastStore } from '@/store/toastStore'

interface MarkPickedUpInput {
  id: string
  exceptionNotes?: string
  exceptionPhoto?: File
}

export function useMarkPickedUp() {
  const queryClient = useQueryClient()
  const toast = useToastStore((s) => s.show)
  return useMutation({
    mutationFn: ({ id, exceptionNotes, exceptionPhoto }: MarkPickedUpInput) =>
      loadsApi.pickup(id, { exceptionNotes, exceptionPhoto }),
    onSuccess: (load) => {
      loadQueryInvalidations.onPickup(queryClient, load.id)
      toast("Pickup confirmed — you're now in transit.")
    },
  })
}
