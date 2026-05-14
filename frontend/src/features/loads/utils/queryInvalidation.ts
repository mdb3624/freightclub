import type { QueryClient } from '@tanstack/react-query'

export const loadQueryInvalidations = {
  onClaim: (qc: QueryClient) => {
    qc.invalidateQueries({ queryKey: ['board'] })
    qc.invalidateQueries({ queryKey: ['my-active-load'] })
  },
  onPickup: (qc: QueryClient, loadId: string) => {
    qc.invalidateQueries({ queryKey: ['my-active-load'] })
    qc.invalidateQueries({ queryKey: ['board', loadId] })
  },
  onDelivery: (qc: QueryClient, loadId: string) => {
    qc.invalidateQueries({ queryKey: ['my-active-load'] })
    qc.invalidateQueries({ queryKey: ['board', loadId] })
    qc.invalidateQueries({ queryKey: ['my-load-history'] })
  },
  onCancel: (qc: QueryClient, loadId: string) => {
    qc.invalidateQueries({ queryKey: ['loads'] })
    qc.invalidateQueries({ queryKey: ['loads', loadId] })
  },
}
