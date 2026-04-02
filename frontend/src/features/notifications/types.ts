export type NotificationType =
  | 'LOAD_CLAIMED'
  | 'LOAD_PICKED_UP'
  | 'LOAD_DELIVERED'
  | 'LOAD_CANCELLED'

export interface Notification {
  id: string
  loadId: string
  type: NotificationType
  message: string
  read: boolean
  createdAt: string
}

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}
