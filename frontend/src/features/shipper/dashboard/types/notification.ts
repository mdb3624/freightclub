/**
 * Notification type definitions for Messages & Alerts Panel (US-826)
 * Maps API Notification type to display format with computed properties
 */

import { Notification as ApiNotification, NotificationType } from '../../../notifications/types';

/** Map API NotificationType to display severity and icon */
const NOTIFICATION_CONFIG: Record<NotificationType, { severity: NotificationSeverity; icon: string; eventType: NotificationEventType }> = {
  'LOAD_CLAIMED': { severity: 'info', icon: '🔔', eventType: 'claimed' },
  'LOAD_PICKED_UP': { severity: 'info', icon: '✓', eventType: 'picked_up' },
  'LOAD_DELIVERED': { severity: 'success', icon: '✅', eventType: 'delivered' },
  'LOAD_CANCELLED': { severity: 'critical', icon: '⚠️', eventType: 'cancelled' },
};

export type NotificationEventType = 'claimed' | 'picked_up' | 'delivered' | 'cancelled';

export type NotificationSeverity = 'info' | 'success' | 'warning' | 'critical';

export interface NotificationDisplayData extends ApiNotification {
  relativeTime: string; // e.g., "2h ago", "15m ago"
  severity: NotificationSeverity;
  eventType: NotificationEventType;
  isRead: boolean; // alias for 'read' from API
  icon: string; // emoji or icon name
}

/**
 * Helper: Transform API Notification to NotificationDisplayData
 */
export function transformNotification(notif: ApiNotification): Omit<NotificationDisplayData, 'relativeTime'> {
  const config = NOTIFICATION_CONFIG[notif.type];
  return {
    ...notif,
    severity: config.severity,
    eventType: config.eventType,
    icon: config.icon,
    isRead: notif.read,
  };
}
