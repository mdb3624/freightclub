import { apiGet, apiPatch } from '@/lib/apiClient'
import type { Notification, Page } from './types'

export const notificationsApi = {
  list: (page = 0, size = 20) =>
    apiGet<Page<Notification>>('/notifications', { params: { page, size } }),

  unreadCount: () =>
    apiGet<{ count: number }>('/notifications/unread-count'),

  markRead: (id: string) =>
    apiPatch<void>(`/notifications/${id}/read`),

  markAllRead: () =>
    apiPatch<{ marked: number }>('/notifications/read-all'),
}
