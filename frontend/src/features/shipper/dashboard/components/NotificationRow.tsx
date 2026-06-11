import React from 'react';
import { NotificationDisplayData } from '../types/notification';

interface NotificationRowProps {
  notification: NotificationDisplayData;
  onClick: (loadId: string) => void;
  index: number;
}

export const NotificationRow: React.FC<NotificationRowProps> = ({
  notification,
  onClick,
  index,
}) => {
  const severityColorMap = {
    info: 'text-blue-500',
    success: 'text-green-500',
    warning: 'text-amber-500',
    critical: 'text-red-500',
  };

  const borderColorMap = {
    info: 'border-blue-300',
    success: 'border-green-300',
    warning: 'border-amber-300',
    critical: 'border-red-300',
  };

  const backgroundColorMap = {
    info: 'bg-blue-50',
    success: 'bg-green-50',
    warning: 'bg-amber-50',
    critical: 'bg-red-50',
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(notification.loadId);
    }
  };

  const rowClasses = [
    'notification-row',
    `notification-${notification.severity}`,
    notification.isRead ? 'notification-read' : 'notification-unread',
    'flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors',
    notification.isRead
      ? 'border-gray-200 bg-gray-50'
      : `${borderColorMap[notification.severity]} ${backgroundColorMap[notification.severity]}`,
  ].join(' ');

  return (
    <div
      data-testid={`notification-row-${index}`}
      role="button"
      tabIndex={0}
      className={rowClasses}
      onClick={() => onClick(notification.loadId)}
      onKeyDown={handleKeyDown}
    >
      {/* Icon */}
      <span className={`text-lg flex-shrink-0 ${severityColorMap[notification.severity]}`}>
        {notification.icon}
      </span>

      {/* Message */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {notification.message}
        </p>
      </div>

      {/* Relative Time */}
      <span className="text-xs text-gray-500 flex-shrink-0 whitespace-nowrap ml-2">
        {notification.relativeTime}
      </span>
    </div>
  );
};
