/**
 * Notification type definitions for Messages & Alerts Panel (US-826)
 */

export type NotificationEventType = 'claimed' | 'picked_up' | 'delivered' | 'cancelled';

export type NotificationSeverity = 'info' | 'success' | 'warning' | 'critical';

export interface Notification {
  id: string;
  loadId: string;
  message: string; // e.g., "Load 8847 claimed by ABC Trucking"
  eventType: NotificationEventType;
  severity: NotificationSeverity;
  createdAt: string; // ISO timestamp
  isRead: boolean;
  icon: string; // emoji or icon name
}

export interface NotificationDisplayData extends Notification {
  relativeTime: string; // e.g., "2h ago", "15m ago"
}
