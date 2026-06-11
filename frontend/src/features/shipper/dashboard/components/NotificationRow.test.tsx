import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { NotificationRow } from './NotificationRow';
import { NotificationDisplayData } from '../types/notification';

describe('NotificationRow', () => {
  const mockNotification: NotificationDisplayData = {
    id: 'notif-1',
    loadId: 'load-123',
    message: 'Load 8847 claimed by ABC Trucking',
    eventType: 'claimed',
    severity: 'success',
    createdAt: '2024-01-15T10:00:00Z',
    isRead: false,
    icon: '✓',
    relativeTime: '2h ago',
  };

  it('renders notification message', () => {
    const mockOnClick = vi.fn();
    render(
      <NotificationRow
        notification={mockNotification}
        onClick={mockOnClick}
        index={0}
      />
    );

    expect(screen.getByText('Load 8847 claimed by ABC Trucking')).toBeInTheDocument();
  });

  it('renders icon and relative time', () => {
    const mockOnClick = vi.fn();
    render(
      <NotificationRow
        notification={mockNotification}
        onClick={mockOnClick}
        index={0}
      />
    );

    expect(screen.getByText('✓')).toBeInTheDocument();
    expect(screen.getByText('2h ago')).toBeInTheDocument();
  });

  it('applies unread styling when isRead is false', () => {
    const mockOnClick = vi.fn();
    const unreadNotification: NotificationDisplayData = {
      ...mockNotification,
      isRead: false,
    };

    render(
      <NotificationRow
        notification={unreadNotification}
        onClick={mockOnClick}
        index={0}
      />
    );

    const row = screen.getByTestId('notification-row-0');
    expect(row).toHaveClass('notification-unread');
  });

  it('applies read styling when isRead is true', () => {
    const mockOnClick = vi.fn();
    const readNotification: NotificationDisplayData = {
      ...mockNotification,
      isRead: true,
    };

    render(
      <NotificationRow
        notification={readNotification}
        onClick={mockOnClick}
        index={0}
      />
    );

    const row = screen.getByTestId('notification-row-0');
    expect(row).toHaveClass('notification-read');
  });

  it('applies correct severity class based on severity type', () => {
    const mockOnClick = vi.fn();

    const severities: Array<'info' | 'success' | 'warning' | 'critical'> = [
      'info',
      'success',
      'warning',
      'critical',
    ];

    severities.forEach((severity, idx) => {
      const { unmount } = render(
        <NotificationRow
          notification={{ ...mockNotification, severity, id: `notif-${idx}` }}
          onClick={mockOnClick}
          index={idx}
        />
      );

      const row = screen.getByTestId(`notification-row-${idx}`);
      expect(row).toHaveClass(`notification-${severity}`);

      unmount();
    });
  });

  it('calls onClick handler with loadId when clicked', async () => {
    const user = userEvent.setup();
    const mockOnClick = vi.fn();

    render(
      <NotificationRow
        notification={mockNotification}
        onClick={mockOnClick}
        index={0}
      />
    );

    const row = screen.getByTestId('notification-row-0');
    await user.click(row);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
    expect(mockOnClick).toHaveBeenCalledWith('load-123');
  });

  it('is keyboard accessible with Enter key', async () => {
    const user = userEvent.setup();
    const mockOnClick = vi.fn();

    render(
      <NotificationRow
        notification={mockNotification}
        onClick={mockOnClick}
        index={0}
      />
    );

    const row = screen.getByTestId('notification-row-0');
    row.focus();
    await user.keyboard('{Enter}');

    expect(mockOnClick).toHaveBeenCalledTimes(1);
    expect(mockOnClick).toHaveBeenCalledWith('load-123');
  });

  it('is keyboard accessible with Space key', async () => {
    const user = userEvent.setup();
    const mockOnClick = vi.fn();

    render(
      <NotificationRow
        notification={mockNotification}
        onClick={mockOnClick}
        index={0}
      />
    );

    const row = screen.getByTestId('notification-row-0');
    row.focus();
    await user.keyboard(' ');

    expect(mockOnClick).toHaveBeenCalledTimes(1);
    expect(mockOnClick).toHaveBeenCalledWith('load-123');
  });

  it('has correct data-testid with index', () => {
    const mockOnClick = vi.fn();

    render(
      <NotificationRow
        notification={mockNotification}
        onClick={mockOnClick}
        index={5}
      />
    );

    expect(screen.getByTestId('notification-row-5')).toBeInTheDocument();
  });

  it('applies correct icon color based on severity', () => {
    const mockOnClick = vi.fn();

    const severityColors = {
      info: 'text-blue-500',
      success: 'text-green-500',
      warning: 'text-amber-500',
      critical: 'text-red-500',
    };

    Object.entries(severityColors).forEach(([severity, colorClass]) => {
      const { unmount } = render(
        <NotificationRow
          notification={{
            ...mockNotification,
            severity: severity as 'info' | 'success' | 'warning' | 'critical',
            id: `notif-${severity}`,
          }}
          onClick={mockOnClick}
          index={0}
        />
      );

      const iconElement = screen.getByText('✓');
      expect(iconElement).toHaveClass(colorClass);

      unmount();
    });
  });

  it('has proper role and aria attributes for accessibility', () => {
    const mockOnClick = vi.fn();

    render(
      <NotificationRow
        notification={mockNotification}
        onClick={mockOnClick}
        index={0}
      />
    );

    const row = screen.getByTestId('notification-row-0');
    expect(row).toHaveAttribute('role', 'button');
    expect(row).toHaveAttribute('tabindex', '0');
  });
});
