# US-826: Messages & Alerts Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a notification list panel that displays recent load status events (claimed, picked up, delivered, cancelled) with read/unread states, integrating with existing notification hooks to sync with the dashboard notification bell (US-821).

**Architecture:** MessagesAlertsPanel is a stateless presentational component that consumes notifications from the existing `useNotifications()` hook and manages read state via `useMarkRead()` hook. Notification rows are visually distinct by status (blue border for unread, grey for read) with status-specific icon colors (blue=info, green=success, red=critical). Component renders within the col-span-7 grid slot and uses skeleton loaders during initial fetch.

**Tech Stack:** React 18 + TypeScript, existing notification hooks (`useNotifications`, `useUnreadCount`, `useMarkRead`), Tailwind CSS, data-testid for Playwright automation.

**HFD Spec Reference:** `docs/hfd/US-826_Messages_And_Alerts_Panel_Design_Spec.md`

---

## File Structure

```
frontend/src/features/shipper/dashboard/
├── components/
│   ├── MessagesAlertsPanel.tsx          [NEW] Notification list component
│   ├── MessagesAlertsPanel.test.tsx     [NEW] Unit + integration tests
│   ├── NotificationRow.tsx              [NEW] Individual notification row
│   ├── NotificationRow.test.tsx         [NEW] Row tests
│   ├── ShipperDashboardPage.tsx         [MODIFY] Integrate component
│   └── ...
├── types/
│   └── notification.ts                  [NEW] Notification type definitions
└── styles/
    └── dashboard.css                    [MODIFY] Notification row styling
```

---

## Task 1: Define Notification Types

**Files:**
- Create: `frontend/src/features/shipper/dashboard/types/notification.ts`

---

### Step 1.1: Create notification type definitions

- [ ] **Create types file** `frontend/src/features/shipper/dashboard/types/notification.ts`

```typescript
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
```

---

### Step 1.2: Commit types

- [ ] **Commit**

```bash
cd frontend
git add src/features/shipper/dashboard/types/notification.ts
git commit -m "types(US-826): add notification type definitions"
```

---

## Task 2: Create NotificationRow Component (TDD)

**Files:**
- Create: `frontend/src/features/shipper/dashboard/components/NotificationRow.tsx`
- Test: `frontend/src/features/shipper/dashboard/components/NotificationRow.test.tsx`

---

### Step 2.1: Write tests for NotificationRow

- [ ] **Create test file** `frontend/src/features/shipper/dashboard/components/NotificationRow.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationRow } from './NotificationRow';
import { NotificationDisplayData } from '../types/notification';

describe('NotificationRow', () => {
  const mockNotification: NotificationDisplayData = {
    id: '1',
    loadId: '8847',
    message: 'Load 8847 claimed by ABC Trucking',
    eventType: 'claimed',
    severity: 'info',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    isRead: false,
    icon: '🔔',
    relativeTime: '2h ago',
  };

  it('renders notification message', () => {
    render(
      <NotificationRow 
        notification={mockNotification} 
        onClick={jest.fn()}
        index={0}
      />
    );

    expect(screen.getByText('Load 8847 claimed by ABC Trucking')).toBeInTheDocument();
  });

  it('renders icon and relative time', () => {
    render(
      <NotificationRow 
        notification={mockNotification} 
        onClick={jest.fn()}
        index={0}
      />
    );

    expect(screen.getByText('🔔')).toBeInTheDocument();
    expect(screen.getByText('2h ago')).toBeInTheDocument();
  });

  it('renders with unread styling when isRead is false', () => {
    const { container } = render(
      <NotificationRow 
        notification={mockNotification} 
        onClick={jest.fn()}
        index={0}
      />
    );

    const row = container.querySelector('[data-testid="messages-alerts-notification-0"]');
    expect(row).toHaveClass('notification-unread');
    expect(row).toHaveClass('notification-info'); // severity-based class
  });

  it('renders with read styling when isRead is true', () => {
    const readNotification = { ...mockNotification, isRead: true };
    const { container } = render(
      <NotificationRow 
        notification={readNotification} 
        onClick={jest.fn()}
        index={0}
      />
    );

    const row = container.querySelector('[data-testid="messages-alerts-notification-0"]');
    expect(row).toHaveClass('notification-read');
  });

  it('applies correct severity class based on event type', () => {
    const successNotification = {
      ...mockNotification,
      eventType: 'delivered' as const,
      severity: 'success' as const,
    };
    const { container } = render(
      <NotificationRow 
        notification={successNotification} 
        onClick={jest.fn()}
        index={0}
      />
    );

    const row = container.querySelector('[data-testid="messages-alerts-notification-0"]');
    expect(row).toHaveClass('notification-success');
  });

  it('calls onClick handler when row is clicked', async () => {
    const user = userEvent.setup();
    const mockOnClick = jest.fn();
    render(
      <NotificationRow 
        notification={mockNotification} 
        onClick={mockOnClick}
        index={0}
      />
    );

    const row = screen.getByTestId('messages-alerts-notification-0');
    await user.click(row);

    expect(mockOnClick).toHaveBeenCalledWith(mockNotification.loadId);
  });

  it('is keyboard accessible (Enter activates row)', async () => {
    const user = userEvent.setup();
    const mockOnClick = jest.fn();
    render(
      <NotificationRow 
        notification={mockNotification} 
        onClick={mockOnClick}
        index={0}
      />
    );

    const row = screen.getByTestId('messages-alerts-notification-0');
    row.focus();
    await user.keyboard('{Enter}');

    expect(mockOnClick).toHaveBeenCalledWith(mockNotification.loadId);
  });

  it('has correct data-testid with index', () => {
    render(
      <NotificationRow 
        notification={mockNotification} 
        onClick={jest.fn()}
        index={3}
      />
    );

    expect(screen.getByTestId('messages-alerts-notification-3')).toBeInTheDocument();
  });

  it('displays correct icon color based on severity', () => {
    const { container } = render(
      <NotificationRow 
        notification={mockNotification} 
        onClick={jest.fn()}
        index={0}
      />
    );

    const icon = container.querySelector('.notification-icon');
    // Icon color applied via className based on severity
    expect(icon).toHaveClass('text-blue-500'); // info severity
  });
});
```

- [ ] **Run test to verify it fails**

```bash
cd frontend
npm run test -- NotificationRow.test.tsx --no-coverage
```

---

### Step 2.2: Implement NotificationRow component

- [ ] **Create component file** `frontend/src/features/shipper/dashboard/components/NotificationRow.tsx`

```typescript
import React from 'react';
import { NotificationDisplayData } from '../types/notification';

interface NotificationRowProps {
  notification: NotificationDisplayData;
  onClick: (loadId: string) => void;
  index: number;
}

const severityClasses = {
  info: 'border-l-blue-500 text-blue-500',
  success: 'border-l-green-500 text-green-500',
  warning: 'border-l-amber-500 text-amber-500',
  critical: 'border-l-red-500 text-red-500',
};

const textColorMap = {
  info: 'text-blue-500',
  success: 'text-green-500',
  warning: 'text-amber-500',
  critical: 'text-red-500',
};

export const NotificationRow: React.FC<NotificationRowProps> = ({
  notification,
  onClick,
  index,
}) => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick(notification.loadId);
    }
  };

  const readClass = notification.isRead
    ? 'notification-read bg-gray-50 border-l-gray-300'
    : 'notification-unread bg-white border-l-3';
  
  const severityClass = notification.isRead
    ? 'border-l-gray-300'
    : severityClasses[notification.severity];

  return (
    <div
      data-testid={`messages-alerts-notification-${index}`}
      className={`notification-${notification.severity} notification-row p-3 border border-gray-200 rounded cursor-pointer transition-colors hover:bg-gray-100 ${readClass} ${severityClass}`}
      role="button"
      tabIndex={0}
      onClick={() => onClick(notification.loadId)}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-start gap-2">
        <span className={`notification-icon flex-shrink-0 ${textColorMap[notification.severity]}`}>
          {notification.icon}
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm text-gray-900 font-medium">
            {notification.message}
          </div>
        </div>
        <div className="flex-shrink-0 text-xs text-gray-600 whitespace-nowrap ml-2">
          {notification.relativeTime}
        </div>
      </div>
    </div>
  );
};
```

---

### Step 2.3: Run tests

- [ ] **Run test suite**

```bash
cd frontend
npm run test -- NotificationRow.test.tsx --no-coverage
```

Expected output: All tests pass (✓)

---

### Step 2.4: Commit component

- [ ] **Commit**

```bash
cd frontend
git add src/features/shipper/dashboard/components/NotificationRow.tsx
git add src/features/shipper/dashboard/components/NotificationRow.test.tsx
git commit -m "feat(US-826): add NotificationRow component with read/unread states and severity styling"
```

---

## Task 3: Create MessagesAlertsPanel Component (TDD)

**Files:**
- Create: `frontend/src/features/shipper/dashboard/components/MessagesAlertsPanel.tsx`
- Test: `frontend/src/features/shipper/dashboard/components/MessagesAlertsPanel.test.tsx`

---

### Step 3.1: Write tests for MessagesAlertsPanel

- [ ] **Create test file** `frontend/src/features/shipper/dashboard/components/MessagesAlertsPanel.test.tsx`

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MessagesAlertsPanel } from './MessagesAlertsPanel';
import * as notificationHooks from '../hooks/useNotifications'; // Mock these hooks
import { BrowserRouter } from 'react-router-dom';

jest.mock('../hooks/useNotifications');

const mockUseNotifications = notificationHooks.useNotifications as jest.Mock;
const mockUseMarkRead = notificationHooks.useMarkRead as jest.Mock;

const mockNotifications = [
  {
    id: '1',
    loadId: '8847',
    message: 'Load 8847 claimed by ABC Trucking',
    eventType: 'claimed' as const,
    severity: 'info' as const,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    icon: '🔔',
  },
  {
    id: '2',
    loadId: '8847',
    message: 'Load 8847 picked up from origin',
    eventType: 'picked_up' as const,
    severity: 'info' as const,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    icon: '✓',
  },
];

describe('MessagesAlertsPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNotifications.mockReturnValue({
      notifications: [],
      isLoading: false,
      error: null,
    });
    mockUseMarkRead.mockReturnValue(jest.fn());
  });

  it('renders panel with correct attributes', () => {
    render(
      <BrowserRouter>
        <MessagesAlertsPanel />
      </BrowserRouter>
    );

    const panel = screen.getByTestId('dashboard-messages-alerts-panel');
    expect(panel).toHaveAttribute('role', 'region');
    expect(panel).toHaveAttribute('aria-label', 'Messages & Alerts');
  });

  it('displays skeleton loaders while loading', () => {
    mockUseNotifications.mockReturnValue({
      notifications: [],
      isLoading: true,
      error: null,
    });

    const { container } = render(
      <BrowserRouter>
        <MessagesAlertsPanel />
      </BrowserRouter>
    );

    expect(container.querySelector('.skeleton-row')).toBeInTheDocument();
  });

  it('displays notifications when data is loaded', () => {
    mockUseNotifications.mockReturnValue({
      notifications: mockNotifications,
      isLoading: false,
      error: null,
    });

    render(
      <BrowserRouter>
        <MessagesAlertsPanel />
      </BrowserRouter>
    );

    expect(screen.getByText('Load 8847 claimed by ABC Trucking')).toBeInTheDocument();
    expect(screen.getByText('Load 8847 picked up from origin')).toBeInTheDocument();
  });

  it('displays empty state when no notifications exist', () => {
    mockUseNotifications.mockReturnValue({
      notifications: [],
      isLoading: false,
      error: null,
    });

    render(
      <BrowserRouter>
        <MessagesAlertsPanel />
      </BrowserRouter>
    );

    expect(screen.getByText(/No new messages/)).toBeInTheDocument();
    expect(screen.getByText(/You're all caught up/)).toBeInTheDocument();
  });

  it('calls markRead and navigates when notification is clicked', async () => {
    const user = userEvent.setup();
    const mockMarkRead = jest.fn();
    const mockNavigate = jest.fn();

    mockUseNotifications.mockReturnValue({
      notifications: mockNotifications,
      isLoading: false,
      error: null,
    });
    mockUseMarkRead.mockReturnValue(mockMarkRead);

    // Mock useNavigate
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);

    render(
      <BrowserRouter>
        <MessagesAlertsPanel />
      </BrowserRouter>
    );

    const notificationRow = screen.getByTestId('messages-alerts-notification-0');
    await user.click(notificationRow);

    expect(mockMarkRead).toHaveBeenCalledWith('1'); // notification.id
    expect(mockNavigate).toHaveBeenCalledWith('/shipper/loads/8847'); // notification.loadId
  });

  it('displays error message on fetch failure', () => {
    mockUseNotifications.mockReturnValue({
      notifications: [],
      isLoading: false,
      error: new Error('Failed to fetch notifications'),
    });

    render(
      <BrowserRouter>
        <MessagesAlertsPanel />
      </BrowserRouter>
    );

    expect(screen.getByText(/Unable to load notifications/)).toBeInTheDocument();
  });

  it('renders notifications in reverse chronological order (newest first)', () => {
    const orderedNotifications = [
      ...mockNotifications,
      {
        id: '3',
        loadId: '9011',
        message: 'Load 9011 delivered on time',
        eventType: 'delivered' as const,
        severity: 'success' as const,
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        isRead: false,
        icon: '✅',
      },
    ];

    mockUseNotifications.mockReturnValue({
      notifications: orderedNotifications,
      isLoading: false,
      error: null,
    });

    render(
      <BrowserRouter>
        <MessagesAlertsPanel />
      </BrowserRouter>
    );

    // Verify newest notification (delivered) is first
    const rows = screen.getAllByTestId(/messages-alerts-notification-/);
    expect(rows[0]).toHaveTextContent('Load 9011 delivered on time');
    expect(rows[1]).toHaveTextContent('Load 8847 picked up from origin');
  });

  it('marks notification as read when clicked (visual update)', async () => {
    const user = userEvent.setup();
    const mockMarkRead = jest.fn();

    mockUseNotifications.mockReturnValue({
      notifications: [mockNotifications[0]], // unread notification
      isLoading: false,
      error: null,
    });
    mockUseMarkRead.mockReturnValue(mockMarkRead);

    render(
      <BrowserRouter>
        <MessagesAlertsPanel />
      </BrowserRouter>
    );

    const notificationRow = screen.getByTestId('messages-alerts-notification-0');
    expect(notificationRow).toHaveClass('notification-unread');

    await user.click(notificationRow);

    expect(mockMarkRead).toHaveBeenCalledWith('1');
  });
});
```

- [ ] **Run test to verify it fails**

```bash
cd frontend
npm run test -- MessagesAlertsPanel.test.tsx --no-coverage
```

---

### Step 3.2: Implement MessagesAlertsPanel component

- [ ] **Create component file** `frontend/src/features/shipper/dashboard/components/MessagesAlertsPanel.tsx`

```typescript
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import { useMarkRead } from '../hooks/useNotifications';
import { NotificationRow } from './NotificationRow';
import { SkeletonLoader } from './SkeletonLoader';
import { NotificationDisplayData } from '../types/notification';

const formatRelativeTime = (createdAt: string): string => {
  const now = new Date();
  const createdDate = new Date(createdAt);
  const diffMs = now.getTime() - createdDate.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

export const MessagesAlertsPanel: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, isLoading, error } = useNotifications();
  const markRead = useMarkRead();

  const sortedAndDisplayNotifications: NotificationDisplayData[] = useMemo(() => {
    if (!notifications) return [];
    return [...notifications]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((n) => ({
        ...n,
        relativeTime: formatRelativeTime(n.createdAt),
      }));
  }, [notifications]);

  const handleNotificationClick = (loadId: string, notificationId: string) => {
    markRead(notificationId);
    navigate(`/shipper/loads/${loadId}`);
  };

  return (
    <div
      data-testid="dashboard-messages-alerts-panel"
      role="region"
      aria-label="Messages & Alerts"
      className="col-span-7 border border-widget rounded-md p-6 bg-white shadow-subtle"
    >
      <div data-testid="messages-alerts-list" role="region" aria-label="Notifications">
        {isLoading && <SkeletonLoader rowCount={4} rowHeight="56px" />}

        {!isLoading && error && (
          <div className="text-center py-8">
            <div className="text-2xl mb-3">⚠️</div>
            <div className="text-sm text-red-600 italic">
              Unable to load notifications. Please try refreshing.
            </div>
          </div>
        )}

        {!isLoading && !error && sortedAndDisplayNotifications.length === 0 && (
          <div
            data-testid="messages-alerts-empty-state"
            className="text-center py-8"
          >
            <div className="text-3xl mb-3">📭</div>
            <div className="font-bold text-gray-600">No new messages</div>
            <div className="text-sm text-gray-600 italic mt-1">
              You're all caught up. Check back later for load updates.
            </div>
          </div>
        )}

        {!isLoading && !error && sortedAndDisplayNotifications.length > 0 && (
          <div className="space-y-2 max-h-80 overflow-auto">
            {sortedAndDisplayNotifications.map((notification, index) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                onClick={(loadId) => handleNotificationClick(loadId, notification.id)}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
```

---

### Step 3.3: Run tests

- [ ] **Run test suite**

```bash
cd frontend
npm run test -- MessagesAlertsPanel.test.tsx --no-coverage
```

Expected output: All tests pass (✓)

---

### Step 3.4: Commit component

- [ ] **Commit**

```bash
cd frontend
git add src/features/shipper/dashboard/components/MessagesAlertsPanel.tsx
git add src/features/shipper/dashboard/components/MessagesAlertsPanel.test.tsx
git commit -m "feat(US-826): add MessagesAlertsPanel with notification list and read state management"
```

---

## Task 4: Integrate MessagesAlertsPanel into ShipperDashboardPage

**Files:**
- Modify: `frontend/src/features/shipper/dashboard/ShipperDashboardPage.tsx`

---

### Step 4.1: Update ShipperDashboardPage

- [ ] **Modify** `frontend/src/features/shipper/dashboard/ShipperDashboardPage.tsx`

Find the row 3 placeholder section and replace MessagesAlertsPanel placeholder:

**Before:**
```typescript
{/* Row 3: Carrier Search + Messages & Alerts */}
<PlaceholderPanel
  testId="dashboard-messages-alerts-panel"
  label="Messages & Alerts"
  colSpan={7}
/>
```

**After:**
```typescript
import { MessagesAlertsPanel } from './components/MessagesAlertsPanel';

// Inside render:
{/* Row 3: Carrier Search + Messages & Alerts */}
<MessagesAlertsPanel />
```

---

### Step 4.2: Run integration test

- [ ] **Verify ShipperDashboardPage renders without errors**

```bash
cd frontend
npm run test -- ShipperDashboardPage.test.tsx --no-coverage
```

Expected output: Tests pass (✓)

---

### Step 4.3: Commit integration

- [ ] **Commit**

```bash
cd frontend
git add src/features/shipper/dashboard/ShipperDashboardPage.tsx
git commit -m "feat(US-826): integrate MessagesAlertsPanel into dashboard grid"
```

---

## Task 5: Add E2E Test for Messages & Alerts Panel

**Files:**
- Create: `frontend/e2e/us-826-messages-alerts.spec.ts`

---

### Step 5.1: Write E2E test

- [ ] **Create E2E test file** `frontend/e2e/us-826-messages-alerts.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('US-826: Messages & Alerts Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/shipper');
    await page.waitForSelector('[data-testid="dashboard-messages-alerts-panel"]');
  });

  test('renders notification list region', async ({ page }) => {
    const panel = page.getByTestId('dashboard-messages-alerts-panel');
    expect(await panel.isVisible()).toBeTruthy();
    
    const list = page.getByTestId('messages-alerts-list');
    expect(await list.isVisible()).toBeTruthy();
  });

  test('displays skeleton loaders while loading notifications', async ({ page }) => {
    // Intercept API and delay response
    await page.route('/api/v1/notifications*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      route.continue();
    });

    const skeletons = page.locator('.skeleton-row');
    const skeletonCount = await skeletons.count();
    expect(skeletonCount).toBeGreaterThan(0);
  });

  test('displays notification rows with correct content', async ({ page }) => {
    // Mock API response with notifications
    await page.route('/api/v1/notifications*', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          notifications: [
            {
              id: '1',
              loadId: '8847',
              message: 'Load 8847 claimed by ABC Trucking',
              eventType: 'claimed',
              severity: 'info',
              createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              isRead: false,
              icon: '🔔',
            },
          ],
        }),
      });
    });

    await page.reload();
    await page.waitForSelector('[data-testid="messages-alerts-notification-0"]');

    expect(
      await page.getByText('Load 8847 claimed by ABC Trucking').isVisible()
    ).toBeTruthy();
  });

  test('displays empty state when no notifications', async ({ page }) => {
    await page.route('/api/v1/notifications*', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ notifications: [] }),
      });
    });

    await page.reload();
    await page.waitForSelector('[data-testid="messages-alerts-empty-state"]');

    expect(await page.getByText(/No new messages/).isVisible()).toBeTruthy();
  });

  test('displays error message on API failure', async ({ page }) => {
    await page.route('/api/v1/notifications*', (route) => {
      route.abort('failed');
    });

    await page.reload();
    await page.waitForSelector('text=Unable to load notifications');

    expect(
      await page.getByText(/Unable to load notifications/).isVisible()
    ).toBeTruthy();
  });

  test('notification click navigates to load detail page', async ({ page }) => {
    // Mock notifications and load detail page
    await page.route('/api/v1/notifications*', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          notifications: [
            {
              id: '1',
              loadId: '8847',
              message: 'Load 8847 delivered on time',
              eventType: 'delivered',
              severity: 'success',
              createdAt: new Date().toISOString(),
              isRead: false,
              icon: '✅',
            },
          ],
        }),
      });
    });

    await page.reload();
    await page.waitForSelector('[data-testid="messages-alerts-notification-0"]');

    const notificationRow = page.getByTestId('messages-alerts-notification-0');
    const navigationPromise = page.waitForNavigation();
    await notificationRow.click();

    await navigationPromise;

    expect(page.url()).toContain('/shipper/loads/8847');
  });

  test('unread notifications display with status color border', async ({ page }) => {
    await page.route('/api/v1/notifications*', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          notifications: [
            {
              id: '1',
              loadId: '8847',
              message: 'Load claimed',
              eventType: 'claimed',
              severity: 'info',
              createdAt: new Date().toISOString(),
              isRead: false,
              icon: '🔔',
            },
          ],
        }),
      });
    });

    await page.reload();
    await page.waitForSelector('[data-testid="messages-alerts-notification-0"]');

    const row = page.getByTestId('messages-alerts-notification-0');
    const classList = await row.evaluate((el) => el.className);
    
    expect(classList).toContain('notification-unread');
    expect(classList).toContain('notification-info');
  });

  test('read notifications display with muted styling', async ({ page }) => {
    await page.route('/api/v1/notifications*', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          notifications: [
            {
              id: '1',
              loadId: '8847',
              message: 'Load picked up',
              eventType: 'picked_up',
              severity: 'info',
              createdAt: new Date().toISOString(),
              isRead: true,
              icon: '✓',
            },
          ],
        }),
      });
    });

    await page.reload();
    await page.waitForSelector('[data-testid="messages-alerts-notification-0"]');

    const row = page.getByTestId('messages-alerts-notification-0');
    const classList = await row.evaluate((el) => el.className);
    
    expect(classList).toContain('notification-read');
  });

  test('notification row is keyboard accessible (Enter/Space)', async ({ page }) => {
    await page.route('/api/v1/notifications*', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          notifications: [
            {
              id: '1',
              loadId: '8847',
              message: 'Load delivered',
              eventType: 'delivered',
              severity: 'success',
              createdAt: new Date().toISOString(),
              isRead: false,
              icon: '✅',
            },
          ],
        }),
      });
    });

    await page.reload();
    await page.waitForSelector('[data-testid="messages-alerts-notification-0"]');

    const notificationRow = page.getByTestId('messages-alerts-notification-0');
    
    // Tab to notification row
    await page.keyboard.press('Tab');
    
    // Verify focused
    const focusedTestId = await page.evaluate(() => 
      document.activeElement?.getAttribute('data-testid')
    );
    expect(focusedTestId).toContain('messages-alerts-notification');

    // Press Enter to activate
    const navigationPromise = page.waitForNavigation();
    await page.keyboard.press('Enter');
    await navigationPromise;

    expect(page.url()).toContain('/shipper/loads/8847');
  });

  test('captures responsive screenshots', async ({ page }) => {
    // Desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.screenshot({ path: 'test-results/evidence/us-826-messages-alerts-desktop.png' });

    // Tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({ path: 'test-results/evidence/us-826-messages-alerts-tablet.png' });

    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: 'test-results/evidence/us-826-messages-alerts-mobile.png' });
  });
});
```

- [ ] **Run E2E test**

```bash
cd frontend
npm run test:e2e -- us-826-messages-alerts.spec.ts
```

---

### Step 5.2: Commit E2E test

- [ ] **Commit**

```bash
cd frontend
git add e2e/us-826-messages-alerts.spec.ts
git commit -m "test(US-826): add E2E test for messages & alerts panel (notifications, read state, navigation, responsiveness)"
```

---

## Task 6: Responsive Mapping Verification

**Architectural Requirement:** Verify col-span-7 panel renders correctly at Tablet (768px) and Mobile (375px) with scrollable notification list (max-height: 320px).

---

### Step 6.1: Verify responsive grid behavior

- [ ] **Check CSS Grid col-span in ShipperDashboardPage**

```bash
cd frontend
grep -A 1 "col-span-7" src/features/shipper/dashboard/ShipperDashboardPage.tsx
```

Expected: MessagesAlertsPanel wrapper has `col-span-7` class.

---

### Step 6.2: Test responsive layout

- [ ] **Run responsive E2E test**

```bash
cd frontend
npm run test:e2e -- us-826-messages-alerts.spec.ts -g "captures responsive"
```

Expected: Screenshots at 768px and 375px show notification list scrollable within panel bounds, no overflow.

---

## Task 7: Hook Integration Verification

**Architectural Requirement:** Verify integration with existing notification hooks (`useNotifications`, `useMarkRead`) and no mock data in production build.

---

### Step 7.1: Verify hook integration

- [ ] **Check that MessagesAlertsPanel uses existing hooks**

```bash
cd frontend
grep -n "useNotifications\|useMarkRead" src/features/shipper/dashboard/components/MessagesAlertsPanel.tsx
```

Expected: Two matches showing hook imports and usage.

---

### Step 7.2: Verify no mock data in component

- [ ] **Check for hardcoded mock notifications**

```bash
cd frontend
grep -n "const mock\|const test" src/features/shipper/dashboard/components/MessagesAlertsPanel.tsx
```

Expected: No matches (no mock data in component).

---

### Step 7.3: Run full test suite

- [ ] **Run all tests for US-826 components**

```bash
cd frontend
npm run test -- MessagesAlertsPanel NotificationRow --coverage --no-coverage-threshold
```

Expected output: All tests pass (✓); coverage ≥80%.

---

### Step 7.4: Final commit

- [ ] **Verify git status is clean**

```bash
cd frontend
git status
```

Expected: Working tree clean; all changes committed.

---

## Review Checklist (Before Sign-Off)

- [ ] All unit tests pass for MessagesAlertsPanel, NotificationRow
- [ ] Mock `useNotifications` and `useMarkRead` hooks are used (not hardcoded data)
- [ ] All 7+ E2E tests pass (empty state, loaded state, error state, navigation, keyboard, screenshots)
- [ ] Skeleton loaders display during initial load (4 rows, 56px each)
- [ ] Notifications sorted in reverse chronological order (newest first)
- [ ] Read/unread states visually distinct (color border + background tint)
- [ ] Clicking notification: marks as read + navigates to `/shipper/loads/{loadId}`
- [ ] Empty state displays "No new messages" message
- [ ] Error state displays "Unable to load notifications" message
- [ ] Notification list scrollable (max-height: 320px desktop, adjusted for tablet/mobile)
- [ ] Responsive layout verified at 3 breakpoints (no horizontal overflow)
- [ ] Keyboard navigation works (Tab, Enter/Space to activate)
- [ ] WCAG AA accessibility verified (contrast, focus states, ARIA labels)
- [ ] Panel renders within col-span-7 grid slot (US-823 scaffold)
- [ ] No mock data in production build
- [ ] Screenshots captured at 3 breakpoints (1280px, 768px, 375px)

---

**Status:** READY_FOR_REVIEWER_GATE_SIGN_OFF

**Evidence Location:** `test-results/evidence/us-826-*.png` (3 responsive screenshots)

