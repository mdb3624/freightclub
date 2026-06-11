/**
 * MessagesAlertsPanel Component
 * Displays notifications with loading/empty states
 *
 * Feature: US-826 (Messages and Alerts Panel)
 * AC-1: Panel displays notifications with loading state
 * AC-2: Shows empty state when no notifications
 * AC-3: Handles error state on fetch failure
 * AC-4: Click notification → mark read + navigate to load detail
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications, useMarkRead } from '../../../notifications/hooks/useNotifications';
import { NotificationRow } from './NotificationRow';
import { SkeletonLoader } from './SkeletonLoader';
import { NotificationDisplayData } from '../types/notification';

/**
 * Format ISO timestamp to relative time string (e.g., "2h ago")
 * Handles years, months, weeks, days, hours, minutes, and seconds
 */
const formatRelativeTime = (createdAt: string): string => {
  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - createdDate.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 60) {
    return `${diffSeconds}s ago`;
  }

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) {
    return `${diffWeeks}w ago`;
  }

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return `${diffMonths}mo ago`;
  }

  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears}y ago`;
};

export const MessagesAlertsPanel: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useNotifications();
  const markReadMutation = useMarkRead();

  /**
   * Handle notification row click:
   * 1. Mark notification as read
   * 2. Navigate to load detail page
   */
  const handleNotificationClick = (loadId: string, notificationId: string) => {
    markReadMutation.mutate(notificationId);
    navigate(`/loads/${loadId}`);
  };

  /**
   * Transform notifications to display format with relative time
   * Sort by createdAt descending (newest first)
   */
  const displayNotifications: NotificationDisplayData[] = (
    data?.content || []
  )
    .map((notif) => ({
      ...notif,
      relativeTime: formatRelativeTime(notif.createdAt),
    }))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  // Render loading state
  if (isLoading) {
    return (
      <div
        data-testid="dashboard-messages-alerts-panel"
        role="region"
        aria-label="Messages and Alerts"
        className="col-span-7 border border-widget rounded-md p-6 bg-white shadow-subtle max-h-80 overflow-auto"
      >
        <SkeletonLoader rowCount={3} rowHeight="60px" />
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div
        data-testid="dashboard-messages-alerts-panel"
        role="region"
        aria-label="Messages and Alerts"
        className="col-span-7 border border-widget rounded-md p-6 bg-white shadow-subtle max-h-80 overflow-auto"
      >
        <div className="text-center py-8">
          <p className="text-red-600 font-medium">Failed to load notifications</p>
        </div>
      </div>
    );
  }

  // Render empty state
  if (!displayNotifications || displayNotifications.length === 0) {
    return (
      <div
        data-testid="dashboard-messages-alerts-panel"
        role="region"
        aria-label="Messages and Alerts"
        className="col-span-7 border border-widget rounded-md p-6 bg-white shadow-subtle max-h-80 overflow-auto"
      >
        <div className="text-center py-8">
          <p className="text-gray-500">No messages or alerts</p>
        </div>
      </div>
    );
  }

  // Render notification list
  return (
    <div
      data-testid="dashboard-messages-alerts-panel"
      role="region"
      aria-label="Messages and Alerts"
      className="col-span-7 border border-widget rounded-md p-6 bg-white shadow-subtle max-h-80 overflow-auto"
    >
      <div className="space-y-2">
        {displayNotifications.map((notification, index) => (
          <NotificationRow
            key={notification.id}
            notification={notification}
            onClick={(loadId) => handleNotificationClick(loadId, notification.id)}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};
