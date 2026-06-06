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
  onCancel: (qc: QueryClient) => {
    qc.invalidateQueries({ queryKey: ['shipper-loads-stats'] })
    qc.invalidateQueries({ queryKey: ['shipper-loads'] })
  },
  onSettle: (qc: QueryClient, loadId: string) => {
    qc.invalidateQueries({ queryKey: ['shipper-loads-stats'] })
    qc.invalidateQueries({ queryKey: ['shipper-loads'] })
    qc.invalidateQueries({ queryKey: ['load', loadId] })
  },
  onDispute: (qc: QueryClient, loadId: string) => {
    qc.invalidateQueries({ queryKey: ['shipper-loads-stats'] })
    qc.invalidateQueries({ queryKey: ['shipper-loads'] })
    qc.invalidateQueries({ queryKey: ['load', loadId] })
  },
}
