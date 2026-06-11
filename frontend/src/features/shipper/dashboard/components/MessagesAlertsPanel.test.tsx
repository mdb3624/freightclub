import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { MessagesAlertsPanel } from './MessagesAlertsPanel';
import { useNotifications, useMarkRead } from '../../../notifications/hooks/useNotifications';
import { NotificationDisplayData } from '../types/notification';

// Setup mocks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

vi.mock('../../../notifications/hooks/useNotifications', () => ({
  useNotifications: vi.fn(),
  useMarkRead: vi.fn(),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('MessagesAlertsPanel', () => {
  const mockNotifications: NotificationDisplayData[] = [
    {
      id: 'notif-1',
      loadId: 'load-123',
      message: 'Load 8847 claimed by ABC Trucking',
      eventType: 'claimed',
      severity: 'success',
      createdAt: '2024-01-15T10:00:00Z',
      isRead: false,
      icon: '✓',
      relativeTime: '2h ago',
    },
    {
      id: 'notif-2',
      loadId: 'load-456',
      message: 'Load 8848 picked up',
      eventType: 'picked_up',
      severity: 'info',
      createdAt: '2024-01-15T09:00:00Z',
      isRead: true,
      icon: '📦',
      relativeTime: '3h ago',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders panel with correct role and attributes', () => {
    vi.mocked(useNotifications).mockReturnValue({
      data: { content: mockNotifications },
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useMarkRead).mockReturnValue({
      mutate: vi.fn(),
    } as any);

    vi.mocked(useNavigate).mockReturnValue(vi.fn());

    renderWithRouter(<MessagesAlertsPanel />);

    const panel = screen.getByTestId('dashboard-messages-alerts-panel');
    expect(panel).toBeInTheDocument();
    expect(panel).toHaveAttribute('role', 'region');
  });

  it('shows skeleton loaders while loading', () => {
    vi.mocked(useNotifications).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    vi.mocked(useMarkRead).mockReturnValue({
      mutate: vi.fn(),
    } as any);

    vi.mocked(useNavigate).mockReturnValue(vi.fn());

    renderWithRouter(<MessagesAlertsPanel />);

    const skeletonContainer = screen.getByTestId('dashboard-messages-alerts-panel');
    const busyDiv = skeletonContainer.querySelector('[aria-busy="true"]');
    expect(busyDiv).toBeInTheDocument();
  });

  it('displays notification rows when data loaded', () => {
    vi.mocked(useNotifications).mockReturnValue({
      data: { content: mockNotifications },
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useMarkRead).mockReturnValue({
      mutate: vi.fn(),
    } as any);

    vi.mocked(useNavigate).mockReturnValue(vi.fn());

    renderWithRouter(<MessagesAlertsPanel />);

    expect(screen.getByText('Load 8847 claimed by ABC Trucking')).toBeInTheDocument();
    expect(screen.getByText('Load 8848 picked up')).toBeInTheDocument();
  });

  it('displays empty state when no notifications', () => {
    vi.mocked(useNotifications).mockReturnValue({
      data: { content: [] },
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useMarkRead).mockReturnValue({
      mutate: vi.fn(),
    } as any);

    vi.mocked(useNavigate).mockReturnValue(vi.fn());

    renderWithRouter(<MessagesAlertsPanel />);

    expect(screen.getByText('No messages or alerts')).toBeInTheDocument();
  });

  it('shows error message on API failure', () => {
    vi.mocked(useNotifications).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to fetch notifications'),
    } as any);

    vi.mocked(useMarkRead).mockReturnValue({
      mutate: vi.fn(),
    } as any);

    vi.mocked(useNavigate).mockReturnValue(vi.fn());

    renderWithRouter(<MessagesAlertsPanel />);

    expect(screen.getByText('Failed to load notifications')).toBeInTheDocument();
  });

  it('calls markRead and navigates when notification clicked', async () => {
    const user = userEvent.setup();
    const mockMutateFn = vi.fn();
    const mockNavigate = vi.fn();

    vi.mocked(useNotifications).mockReturnValue({
      data: { content: mockNotifications },
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useMarkRead).mockReturnValue({
      mutate: mockMutateFn,
    } as any);

    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    renderWithRouter(<MessagesAlertsPanel />);

    const firstRow = screen.getByTestId('notification-row-0');
    await user.click(firstRow);

    expect(mockMutateFn).toHaveBeenCalledWith('notif-1');
    expect(mockNavigate).toHaveBeenCalledWith('/loads/load-123');
  });

  it('displays notifications in reverse chronological order (newest first)', () => {
    const oldNotif: NotificationDisplayData = {
      id: 'notif-old',
      loadId: 'load-old',
      message: 'Old notification',
      eventType: 'claimed',
      severity: 'info',
      createdAt: '2024-01-14T10:00:00Z',
      isRead: true,
      icon: '📌',
      relativeTime: '1d ago',
    };

    const recentNotif: NotificationDisplayData = {
      id: 'notif-recent',
      loadId: 'load-recent',
      message: 'Recent notification',
      eventType: 'picked_up',
      severity: 'success',
      createdAt: '2024-01-15T15:00:00Z',
      isRead: false,
      icon: '✓',
      relativeTime: '5m ago',
    };

    vi.mocked(useNotifications).mockReturnValue({
      data: { content: [oldNotif, recentNotif] }, // intentionally out of order
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useMarkRead).mockReturnValue({
      mutate: vi.fn(),
    } as any);

    vi.mocked(useNavigate).mockReturnValue(vi.fn());

    renderWithRouter(<MessagesAlertsPanel />);

    const rows = screen.getAllByTestId(/notification-row-/);
    expect(rows[0]).toHaveTextContent('Recent notification');
    expect(rows[1]).toHaveTextContent('Old notification');
  });

  it('maintains read/unread visual distinction', () => {
    vi.mocked(useNotifications).mockReturnValue({
      data: { content: mockNotifications },
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useMarkRead).mockReturnValue({
      mutate: vi.fn(),
    } as any);

    vi.mocked(useNavigate).mockReturnValue(vi.fn());

    renderWithRouter(<MessagesAlertsPanel />);

    const unreadRow = screen.getByTestId('notification-row-0');
    const readRow = screen.getByTestId('notification-row-1');

    expect(unreadRow).toHaveClass('notification-unread');
    expect(readRow).toHaveClass('notification-read');
  });

  it('applies max-height and overflow-auto styling', () => {
    vi.mocked(useNotifications).mockReturnValue({
      data: { content: mockNotifications },
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useMarkRead).mockReturnValue({
      mutate: vi.fn(),
    } as any);

    vi.mocked(useNavigate).mockReturnValue(vi.fn());

    renderWithRouter(<MessagesAlertsPanel />);

    const panel = screen.getByTestId('dashboard-messages-alerts-panel');
    expect(panel).toHaveClass('max-h-80', 'overflow-auto');
  });

  it('applies correct col-span layout class', () => {
    vi.mocked(useNotifications).mockReturnValue({
      data: { content: mockNotifications },
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useMarkRead).mockReturnValue({
      mutate: vi.fn(),
    } as any);

    vi.mocked(useNavigate).mockReturnValue(vi.fn());

    renderWithRouter(<MessagesAlertsPanel />);

    const panel = screen.getByTestId('dashboard-messages-alerts-panel');
    expect(panel).toHaveClass('col-span-7');
  });

  it('renders panel with proper border and background styling', () => {
    vi.mocked(useNotifications).mockReturnValue({
      data: { content: mockNotifications },
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useMarkRead).mockReturnValue({
      mutate: vi.fn(),
    } as any);

    vi.mocked(useNavigate).mockReturnValue(vi.fn());

    renderWithRouter(<MessagesAlertsPanel />);

    const panel = screen.getByTestId('dashboard-messages-alerts-panel');
    expect(panel).toHaveClass('border', 'rounded-md', 'bg-white', 'shadow-subtle');
  });

  it('renders all notifications even when list is long', () => {
    const manyNotifications = Array.from({ length: 10 }, (_, i) => ({
      id: `notif-${i}`,
      loadId: `load-${i}`,
      message: `Notification ${i}`,
      eventType: 'claimed' as const,
      severity: 'info' as const,
      createdAt: `2024-01-15T${String(10 - i).padStart(2, '0')}:00:00Z`,
      isRead: i % 2 === 0,
      icon: '📌',
      relativeTime: `${i}h ago`,
    }));

    vi.mocked(useNotifications).mockReturnValue({
      data: { content: manyNotifications },
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useMarkRead).mockReturnValue({
      mutate: vi.fn(),
    } as any);

    vi.mocked(useNavigate).mockReturnValue(vi.fn());

    renderWithRouter(<MessagesAlertsPanel />);

    for (let i = 0; i < 10; i++) {
      expect(screen.getByTestId(`notification-row-${i}`)).toBeInTheDocument();
    }
  });
});
