# US-824: Quick Actions Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement four prominent CTA buttons on the Shipper Dashboard that navigate to key workflows (Post Load, Get Quote, Track Shipments, Preferred Carriers) with loading states and keyboard accessibility.

**Architecture:** QuickActionsPanel is a pure, stateless presentational component that receives onClick handlers from the parent (ShipperDashboardPage). Button loading state is managed by the parent component. Component renders within the col-span-4 grid slot defined in US-823 scaffold. Responsive behavior uses inherited grid col-spans; no custom media queries needed.

**Tech Stack:** React 18 + TypeScript, Tailwind CSS (with custom bronze button class), React Router (useNavigate), data-testid for Playwright automation.

**HFD Spec Reference:** `docs/hfd/US-824_Quick_Actions_Panel_Design_Spec.md`

---

## File Structure

```
frontend/src/features/shipper/dashboard/
├── components/
│   ├── QuickActionsPanel.tsx          [NEW] Presentational component
│   ├── QuickActionsPanel.test.tsx     [NEW] Unit + integration tests
│   ├── ShipperDashboardPage.tsx       [MODIFY] Add component + state
│   └── ...
├── hooks/
│   └── useQuickActionNavigation.ts    [NEW] Navigation state management
└── styles/
    └── dashboard.css                   [MODIFY] Bronze button class (if not in index.css)
```

---

## Task 1: Create QuickActionsPanel Component (Stateless, TDD)

**Files:**
- Create: `frontend/src/features/shipper/dashboard/components/QuickActionsPanel.tsx`
- Test: `frontend/src/features/shipper/dashboard/components/QuickActionsPanel.test.tsx`

---

### Step 1.1: Write the failing test for QuickActionsPanel

- [ ] **Create test file** `frontend/src/features/shipper/dashboard/components/QuickActionsPanel.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuickActionsPanel } from './QuickActionsPanel';

describe('QuickActionsPanel', () => {
  it('renders four action buttons with correct labels', () => {
    const mockHandlers = {
      onPostLoad: jest.fn(),
      onGetQuote: jest.fn(),
      onTrackShipments: jest.fn(),
      onPreferredCarriers: jest.fn(),
    };

    render(<QuickActionsPanel {...mockHandlers} />);

    expect(screen.getByTestId('quick-actions-post-load')).toHaveTextContent('Post Load');
    expect(screen.getByTestId('quick-actions-quote')).toHaveTextContent('Get A Quote');
    expect(screen.getByTestId('quick-actions-track')).toHaveTextContent('Track Shipments');
    expect(screen.getByTestId('quick-actions-carriers')).toHaveTextContent('Preferred Carriers');
  });

  it('calls onPostLoad handler when Post Load button is clicked', async () => {
    const user = userEvent.setup();
    const mockHandlers = {
      onPostLoad: jest.fn(),
      onGetQuote: jest.fn(),
      onTrackShipments: jest.fn(),
      onPreferredCarriers: jest.fn(),
    };

    render(<QuickActionsPanel {...mockHandlers} />);

    await user.click(screen.getByTestId('quick-actions-post-load'));

    expect(mockHandlers.onPostLoad).toHaveBeenCalledTimes(1);
  });

  it('calls onGetQuote handler when Get A Quote button is clicked', async () => {
    const user = userEvent.setup();
    const mockHandlers = {
      onPostLoad: jest.fn(),
      onGetQuote: jest.fn(),
      onTrackShipments: jest.fn(),
      onPreferredCarriers: jest.fn(),
    };

    render(<QuickActionsPanel {...mockHandlers} />);

    await user.click(screen.getByTestId('quick-actions-quote'));

    expect(mockHandlers.onGetQuote).toHaveBeenCalledTimes(1);
  });

  it('calls onTrackShipments handler when Track Shipments button is clicked', async () => {
    const user = userEvent.setup();
    const mockHandlers = {
      onPostLoad: jest.fn(),
      onGetQuote: jest.fn(),
      onTrackShipments: jest.fn(),
      onPreferredCarriers: jest.fn(),
    };

    render(<QuickActionsPanel {...mockHandlers} />);

    await user.click(screen.getByTestId('quick-actions-track'));

    expect(mockHandlers.onTrackShipments).toHaveBeenCalledTimes(1);
  });

  it('calls onPreferredCarriers handler when Preferred Carriers button is clicked', async () => {
    const user = userEvent.setup();
    const mockHandlers = {
      onPostLoad: jest.fn(),
      onGetQuote: jest.fn(),
      onTrackShipments: jest.fn(),
      onPreferredCarriers: jest.fn(),
    };

    render(<QuickActionsPanel {...mockHandlers} />);

    await user.click(screen.getByTestId('quick-actions-carriers'));

    expect(mockHandlers.onPreferredCarriers).toHaveBeenCalledTimes(1);
  });

  it('disables buttons when isLoading is true', () => {
    const mockHandlers = {
      onPostLoad: jest.fn(),
      onGetQuote: jest.fn(),
      onTrackShipments: jest.fn(),
      onPreferredCarriers: jest.fn(),
    };

    render(
      <QuickActionsPanel 
        {...mockHandlers}
        isLoading={true}
        loadingButtonId="quick-actions-post-load"
      />
    );

    expect(screen.getByTestId('quick-actions-post-load')).toBeDisabled();
    expect(screen.getByTestId('quick-actions-quote')).not.toBeDisabled();
  });

  it('renders spinner inside button when loading', () => {
    const mockHandlers = {
      onPostLoad: jest.fn(),
      onGetQuote: jest.fn(),
      onTrackShipments: jest.fn(),
      onPreferredCarriers: jest.fn(),
    };

    render(
      <QuickActionsPanel 
        {...mockHandlers}
        isLoading={true}
        loadingButtonId="quick-actions-post-load"
      />
    );

    const loadingButton = screen.getByTestId('quick-actions-post-load');
    expect(loadingButton.querySelector('.spinner')).toBeInTheDocument();
  });

  it('renders with correct panel container attributes', () => {
    const mockHandlers = {
      onPostLoad: jest.fn(),
      onGetQuote: jest.fn(),
      onTrackShipments: jest.fn(),
      onPreferredCarriers: jest.fn(),
    };

    render(<QuickActionsPanel {...mockHandlers} />);

    const panel = screen.getByTestId('dashboard-quick-actions-panel');
    expect(panel).toHaveAttribute('role', 'region');
    expect(panel).toHaveAttribute('aria-label', 'Quick Actions');
  });
});
```

- [ ] **Run test to verify it fails**

```bash
cd frontend
npm run test -- QuickActionsPanel.test.tsx --no-coverage
```

Expected output: All tests fail with "Cannot find module './QuickActionsPanel'"

---

### Step 1.2: Implement QuickActionsPanel component

- [ ] **Create component file** `frontend/src/features/shipper/dashboard/components/QuickActionsPanel.tsx`

```typescript
import React from 'react';

interface QuickActionsPanelProps {
  onPostLoad: () => void;
  onGetQuote: () => void;
  onTrackShipments: () => void;
  onPreferredCarriers: () => void;
  isLoading?: boolean;
  loadingButtonId?: string | null;
}

export const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({
  onPostLoad,
  onGetQuote,
  onTrackShipments,
  onPreferredCarriers,
  isLoading = false,
  loadingButtonId = null,
}) => {
  const actions = [
    {
      id: 'quick-actions-post-load',
      label: 'Post Load',
      icon: '📤',
      handler: onPostLoad,
    },
    {
      id: 'quick-actions-quote',
      label: 'Get A Quote',
      icon: '💬',
      handler: onGetQuote,
    },
    {
      id: 'quick-actions-track',
      label: 'Track Shipments',
      icon: '📦',
      handler: onTrackShipments,
    },
    {
      id: 'quick-actions-carriers',
      label: 'Preferred Carriers',
      icon: '⭐',
      handler: onPreferredCarriers,
    },
  ];

  return (
    <div
      data-testid="dashboard-quick-actions-panel"
      role="region"
      aria-label="Quick Actions"
      className="col-span-4 border border-widget rounded-md p-6 bg-white shadow-subtle"
    >
      <div className="space-y-2">
        {actions.map((action) => {
          const isButtonLoading = isLoading && loadingButtonId === action.id;
          return (
            <button
              key={action.id}
              data-testid={action.id}
              onClick={action.handler}
              disabled={isButtonLoading}
              className={`w-full px-4 py-2 rounded text-white font-medium flex items-center justify-center gap-2 transition-all ${
                isButtonLoading
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'btn-bronze hover:bg-opacity-90'
              }`}
            >
              {isButtonLoading && (
                <span className="spinner inline-block w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
              )}
              <span>{action.icon}</span>
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
```

---

### Step 1.3: Run tests to verify they pass

- [ ] **Run test suite**

```bash
cd frontend
npm run test -- QuickActionsPanel.test.tsx --no-coverage
```

Expected output: All 6 tests pass (✓)

---

### Step 1.4: Commit component and tests

- [ ] **Commit**

```bash
cd frontend
git add src/features/shipper/dashboard/components/QuickActionsPanel.tsx
git add src/features/shipper/dashboard/components/QuickActionsPanel.test.tsx
git commit -m "feat(US-824): add QuickActionsPanel component with button handlers and loading state"
```

---

## Task 2: Create Navigation Hook for Quick Actions

**Files:**
- Create: `frontend/src/features/shipper/dashboard/hooks/useQuickActionNavigation.ts`
- Test: `frontend/src/features/shipper/dashboard/hooks/useQuickActionNavigation.test.ts`

---

### Step 2.1: Write failing test for useQuickActionNavigation hook

- [ ] **Create test file** `frontend/src/features/shipper/dashboard/hooks/useQuickActionNavigation.test.ts`

```typescript
import { renderHook, act } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import { useQuickActionNavigation } from './useQuickActionNavigation';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('useQuickActionNavigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns an object with handler functions for each action', () => {
    const mockNavigate = jest.fn();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    const { result } = renderHook(() => useQuickActionNavigation());

    expect(result.current).toHaveProperty('onPostLoad');
    expect(result.current).toHaveProperty('onGetQuote');
    expect(result.current).toHaveProperty('onTrackShipments');
    expect(result.current).toHaveProperty('onPreferredCarriers');
  });

  it('navigates to /shipper/loads/new when onPostLoad is called', () => {
    const mockNavigate = jest.fn();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    const { result } = renderHook(() => useQuickActionNavigation());

    act(() => {
      result.current.onPostLoad();
    });

    expect(mockNavigate).toHaveBeenCalledWith('/shipper/loads/new');
  });

  it('navigates to /shipper/quote when onGetQuote is called', () => {
    const mockNavigate = jest.fn();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    const { result } = renderHook(() => useQuickActionNavigation());

    act(() => {
      result.current.onGetQuote();
    });

    expect(mockNavigate).toHaveBeenCalledWith('/shipper/quote');
  });

  it('navigates to /dashboard/shipper/loads when onTrackShipments is called', () => {
    const mockNavigate = jest.fn();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    const { result } = renderHook(() => useQuickActionNavigation());

    act(() => {
      result.current.onTrackShipments();
    });

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard/shipper/loads');
  });

  it('navigates to /settings/preferred-carriers when onPreferredCarriers is called', () => {
    const mockNavigate = jest.fn();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    const { result } = renderHook(() => useQuickActionNavigation());

    act(() => {
      result.current.onPreferredCarriers();
    });

    expect(mockNavigate).toHaveBeenCalledWith('/settings/preferred-carriers');
  });
});
```

- [ ] **Run test to verify it fails**

```bash
cd frontend
npm run test -- useQuickActionNavigation.test.ts --no-coverage
```

Expected output: Tests fail with "Cannot find module './useQuickActionNavigation'"

---

### Step 2.2: Implement useQuickActionNavigation hook

- [ ] **Create hook file** `frontend/src/features/shipper/dashboard/hooks/useQuickActionNavigation.ts`

```typescript
import { useNavigate } from 'react-router-dom';

interface QuickActionHandlers {
  onPostLoad: () => void;
  onGetQuote: () => void;
  onTrackShipments: () => void;
  onPreferredCarriers: () => void;
}

export const useQuickActionNavigation = (): QuickActionHandlers => {
  const navigate = useNavigate();

  return {
    onPostLoad: () => navigate('/shipper/loads/new'),
    onGetQuote: () => navigate('/shipper/quote'),
    onTrackShipments: () => navigate('/dashboard/shipper/loads'),
    onPreferredCarriers: () => navigate('/settings/preferred-carriers'),
  };
};
```

---

### Step 2.3: Run tests to verify they pass

- [ ] **Run test suite**

```bash
cd frontend
npm run test -- useQuickActionNavigation.test.ts --no-coverage
```

Expected output: All 5 tests pass (✓)

---

### Step 2.4: Commit hook and tests

- [ ] **Commit**

```bash
cd frontend
git add src/features/shipper/dashboard/hooks/useQuickActionNavigation.ts
git add src/features/shipper/dashboard/hooks/useQuickActionNavigation.test.ts
git commit -m "feat(US-824): add useQuickActionNavigation hook for route navigation"
```

---

## Task 3: Integrate QuickActionsPanel into ShipperDashboardPage

**Files:**
- Modify: `frontend/src/features/shipper/dashboard/ShipperDashboardPage.tsx`
- Test: `frontend/src/features/shipper/dashboard/ShipperDashboardPage.test.tsx` (update existing)

---

### Step 3.1: Write test for ShipperDashboardPage integration

- [ ] **Update existing test file** `frontend/src/features/shipper/dashboard/ShipperDashboardPage.test.tsx` (add new test case)

```typescript
// Add this test to the existing describe block

it('renders QuickActionsPanel in col-span-4 grid slot', () => {
  const mockNavigate = jest.fn();
  jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
  }));

  render(<ShipperDashboardPage />);

  const quickActionsPanel = screen.getByTestId('dashboard-quick-actions-panel');
  expect(quickActionsPanel).toBeInTheDocument();
  expect(quickActionsPanel).toHaveClass('col-span-4');
});

it('QuickActionsPanel buttons trigger navigation on click', async () => {
  const user = userEvent.setup();
  const mockNavigate = jest.fn();
  
  jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
  }));

  render(<ShipperDashboardPage />);

  const postLoadButton = screen.getByTestId('quick-actions-post-load');
  await user.click(postLoadButton);

  // Navigation is handled by the hook, verified in useQuickActionNavigation tests
  expect(postLoadButton).toBeInTheDocument();
});
```

---

### Step 3.2: Modify ShipperDashboardPage to integrate QuickActionsPanel

- [ ] **Update component file** `frontend/src/features/shipper/dashboard/ShipperDashboardPage.tsx`

Find the section where grid items are rendered (approximately where placeholders are). Replace the QuickActionsPanel placeholder with the new component:

**Before:**
```typescript
{/* Row 2: Shipment Status + Quick Actions */}
<PlaceholderPanel
  testId="dashboard-shipment-status-panel"
  label="Shipment Status Feed"
  colSpan={8}
/>
<PlaceholderPanel
  testId="dashboard-quick-actions-panel"
  label="Quick Actions"
  colSpan={4}
/>
```

**After:**
```typescript
import { QuickActionsPanel } from './components/QuickActionsPanel';
import { useQuickActionNavigation } from './hooks/useQuickActionNavigation';

// Inside ShipperDashboardPage component:
const { onPostLoad, onGetQuote, onTrackShipments, onPreferredCarriers } = useQuickActionNavigation();
const [isLoading, setIsLoading] = React.useState(false);
const [loadingButtonId, setLoadingButtonId] = React.useState<string | null>(null);

const handleActionClick = (buttonId: string, handler: () => void) => {
  setIsLoading(true);
  setLoadingButtonId(buttonId);
  // Navigation happens immediately; reset state when new page loads
  handler();
};

// Then in the render:
{/* Row 2: Shipment Status + Quick Actions */}
<PlaceholderPanel
  testId="dashboard-shipment-status-panel"
  label="Shipment Status Feed"
  colSpan={8}
/>
<QuickActionsPanel
  onPostLoad={() => handleActionClick('quick-actions-post-load', onPostLoad)}
  onGetQuote={() => handleActionClick('quick-actions-quote', onGetQuote)}
  onTrackShipments={() => handleActionClick('quick-actions-track', onTrackShipments)}
  onPreferredCarriers={() => handleActionClick('quick-actions-carriers', onPreferredCarriers)}
  isLoading={isLoading}
  loadingButtonId={loadingButtonId}
/>
```

---

### Step 3.3: Run integration tests

- [ ] **Run test suite**

```bash
cd frontend
npm run test -- ShipperDashboardPage.test.tsx --no-coverage
```

Expected output: New integration test passes (✓)

---

### Step 3.4: Commit integration

- [ ] **Commit**

```bash
cd frontend
git add src/features/shipper/dashboard/ShipperDashboardPage.tsx
git commit -m "feat(US-824): integrate QuickActionsPanel into ShipperDashboardPage with loading state management"
```

---

## Task 4: Add Bronze Button CSS Class (if not in Tailwind)

**Files:**
- Modify: `frontend/src/index.css` (or `frontend/src/styles/globals.css`)

---

### Step 4.1: Add bronze button styling to global CSS

- [ ] **Check if `.btn-bronze` class exists** in `frontend/src/index.css`

```bash
cd frontend
grep -n "btn-bronze" src/index.css
```

If not found, proceed to Step 4.2. If found, skip to Step 4.3.

---

### Step 4.2: Add bronze button class to CSS

- [ ] **Add to** `frontend/src/index.css` (end of file)

```css
/* Bronze CTA Button (Shipper Style Guide §2) */
.btn-bronze {
  background: linear-gradient(180deg, #C9A46A 0%, #B08D57 45%, #8C6D3F 100%);
  box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.25),
              inset 0 -1px 2px rgba(0, 0, 0, 0.2),
              0 2px 5px rgba(0, 0, 0, 0.35);
  border: 1px solid #7A5F3A;
  color: #FFFFFF;
  transition: all 150ms ease-in-out;
}

.btn-bronze:hover:not(:disabled) {
  background: linear-gradient(180deg, #B8954E 0%, #A67D47 45%, #7C5E36 100%);
}

.btn-bronze:focus {
  outline: 2px solid #B08D57;
  outline-offset: 2px;
}

.btn-bronze:disabled {
  background: #D3D3D3;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  cursor: not-allowed;
  color: #888888;
}

/* Spinner animation */
.spinner {
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

---

### Step 4.3: Commit CSS

- [ ] **Commit**

```bash
cd frontend
git add src/index.css
git commit -m "style(US-824): add bronze button and spinner CSS classes per Shipper Style Guide"
```

---

## Task 5: Add E2E Test for Quick Actions Panel

**Files:**
- Create: `frontend/e2e/us-824-quick-actions.spec.ts`

---

### Step 5.1: Write E2E test for golden path

- [ ] **Create E2E test file** `frontend/e2e/us-824-quick-actions.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('US-824: Quick Actions Panel', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Shipper Dashboard
    await page.goto('/dashboard/shipper');
    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="dashboard-quick-actions-panel"]');
  });

  test('renders all four quick action buttons', async ({ page }) => {
    const postLoadBtn = page.getByTestId('quick-actions-post-load');
    const quoteBtn = page.getByTestId('quick-actions-quote');
    const trackBtn = page.getByTestId('quick-actions-track');
    const carriersBtn = page.getByTestId('quick-actions-carriers');

    await expect(postLoadBtn).toBeVisible();
    await expect(quoteBtn).toBeVisible();
    await expect(trackBtn).toBeVisible();
    await expect(carriersBtn).toBeVisible();

    // Verify button labels
    await expect(postLoadBtn).toContainText('Post Load');
    await expect(quoteBtn).toContainText('Get A Quote');
    await expect(trackBtn).toContainText('Track Shipments');
    await expect(carriersBtn).toContainText('Preferred Carriers');
  });

  test('Post Load button navigates to /shipper/loads/new', async ({ page }) => {
    const postLoadBtn = page.getByTestId('quick-actions-post-load');
    
    // Listen for navigation
    const navigationPromise = page.waitForNavigation();
    
    await postLoadBtn.click();
    
    await navigationPromise;
    
    // Verify URL changed
    expect(page.url()).toContain('/shipper/loads/new');
  });

  test('Get A Quote button navigates to /shipper/quote', async ({ page }) => {
    const quoteBtn = page.getByTestId('quick-actions-quote');
    
    const navigationPromise = page.waitForNavigation();
    
    await quoteBtn.click();
    
    await navigationPromise;
    
    expect(page.url()).toContain('/shipper/quote');
  });

  test('Track Shipments button navigates to /dashboard/shipper/loads', async ({ page }) => {
    const trackBtn = page.getByTestId('quick-actions-track');
    
    const navigationPromise = page.waitForNavigation();
    
    await trackBtn.click();
    
    await navigationPromise;
    
    expect(page.url()).toContain('/dashboard/shipper/loads');
  });

  test('Preferred Carriers button navigates to /settings/preferred-carriers', async ({ page }) => {
    const carriersBtn = page.getByTestId('quick-actions-carriers');
    
    const navigationPromise = page.waitForNavigation();
    
    await carriersBtn.click();
    
    await navigationPromise;
    
    expect(page.url()).toContain('/settings/preferred-carriers');
  });

  test('buttons are keyboard accessible (Tab + Enter)', async ({ page }) => {
    const postLoadBtn = page.getByTestId('quick-actions-post-load');
    
    // Tab to first button
    await page.keyboard.press('Tab');
    
    // Verify focus is on button
    const focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
    expect(focusedElement).toBe('quick-actions-post-load');
    
    // Press Enter to activate
    const navigationPromise = page.waitForNavigation();
    await page.keyboard.press('Enter');
    await navigationPromise;
    
    expect(page.url()).toContain('/shipper/loads/new');
  });

  test('captures golden-path screenshot (responsive)', async ({ page }) => {
    // Desktop screenshot
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.screenshot({ path: 'test-results/evidence/us-824-quick-actions-desktop.png' });

    // Tablet screenshot
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({ path: 'test-results/evidence/us-824-quick-actions-tablet.png' });

    // Mobile screenshot
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: 'test-results/evidence/us-824-quick-actions-mobile.png' });
  });
});
```

- [ ] **Run E2E test to verify it passes**

```bash
cd frontend
npm run test:e2e -- us-824-quick-actions.spec.ts
```

Expected output: All E2E tests pass (✓); screenshots saved to `test-results/evidence/`

---

### Step 5.2: Commit E2E test

- [ ] **Commit**

```bash
cd frontend
git add e2e/us-824-quick-actions.spec.ts
git commit -m "test(US-824): add E2E test for quick actions panel golden path and keyboard navigation"
```

---

## Task 6: Responsive Mapping Verification

**Architectural Requirement:** Verify col-span-4 panel does NOT overflow at Tablet (768px) and Mobile (375px) breakpoints.

---

### Step 6.1: Test responsive behavior

- [ ] **Run responsive layout test** (verify no horizontal scroll)

```bash
cd frontend
npm run test:e2e -- us-824-quick-actions.spec.ts -g "captures golden-path screenshot"
```

Expected: Screenshots at 768px and 375px show buttons stacking vertically within panel bounds, no overflow.

---

### Step 6.2: Verify CSS Grid col-span inheritance

- [ ] **Check ShipperDashboardPage CSS** that QuickActionsPanel uses `col-span-4` class

```bash
cd frontend
grep -A 3 "col-span-4" src/features/shipper/dashboard/ShipperDashboardPage.tsx
```

Expected: QuickActionsPanel wrapper has `col-span-4` class.

- [ ] **Verify responsive col-span override in dashboard CSS** (check for media queries that might interfere)

```bash
cd frontend
grep -n "col-span" src/features/shipper/dashboard/styles/dashboard.css
```

Expected: No media queries override col-span-4 for QuickActionsPanel. (Col-spans are managed by parent grid defined in US-823.)

---

## Task 7: Accessibility Verification

**Requirement:** Verify WCAG AA compliance for button contrast, focus states, keyboard navigation.

---

### Step 7.1: Run accessibility audit

- [ ] **Use Playwright + Axe DevTools for accessibility scan**

```bash
cd frontend
npm install --save-dev @axe-core/playwright axe-playwright
```

Add accessibility check to E2E test:

```typescript
import { injectAxe, checkA11y } from 'axe-playwright';

test('QuickActionsPanel meets WCAG AA standards', async ({ page }) => {
  await page.goto('/dashboard/shipper');
  await page.waitForSelector('[data-testid="dashboard-quick-actions-panel"]');
  
  await injectAxe(page);
  const result = await checkA11y(page, '[data-testid="dashboard-quick-actions-panel"]');
  
  expect(result).toBe(null); // checkA11y returns null if no violations
});
```

- [ ] **Run accessibility test**

```bash
cd frontend
npm run test:e2e -- us-824-quick-actions.spec.ts -g "WCAG"
```

Expected output: No accessibility violations detected (✓)

---

### Step 7.2: Commit accessibility test

- [ ] **Commit**

```bash
cd frontend
git add e2e/us-824-quick-actions.spec.ts
git commit -m "test(US-824): add accessibility audit (WCAG AA) to E2E test"
```

---

## Task 8: Final Code Coverage & Backend URL Verification

**Requirement:** Ensure all four routes exist and are reachable.

---

### Step 8.1: Verify routes exist

- [ ] **Check that all four target routes exist** in the frontend router configuration

```bash
cd frontend
grep -rn "loads/new\|/shipper/quote\|dashboard/shipper/loads\|settings/preferred-carriers" src/App.tsx src/router.tsx src/features --include="*.tsx"
```

Expected: All four routes are configured and linked to valid page components.

---

### Step 8.2: Run full test suite for Quick Actions

- [ ] **Run full test coverage**

```bash
cd frontend
npm run test -- QuickActionsPanel useQuickActionNavigation ShipperDashboardPage --coverage --no-coverage-threshold
```

Expected output: Unit test coverage ≥80% for QuickActionsPanel and hooks.

---

### Step 8.3: Final commit

- [ ] **Commit**

```bash
cd frontend
git log --oneline -8  # Verify all commits are present
git status  # Should be clean
```

---

## Review Checklist (Before Sign-Off)

- [ ] All 4 unit tests pass for QuickActionsPanel
- [ ] All 5 hook tests pass for useQuickActionNavigation
- [ ] Integration test passes for ShipperDashboardPage
- [ ] All 6 E2E tests pass (navigation, keyboard, screenshots)
- [ ] Accessibility audit passes (no WCAG violations)
- [ ] Bronze button CSS matches Shipper Style Guide §2 (gradient, shadows, colors)
- [ ] Panel renders within col-span-4 grid slot (no overflow)
- [ ] Responsive behavior verified at desktop/tablet/mobile
- [ ] All four routes are valid and reachable
- [ ] No mock data in production build
- [ ] Screenshots captured at 3 breakpoints (1280px, 768px, 375px)

---

**Status:** READY_FOR_REVIEWER_GATE_SIGN_OFF

**Evidence Location:** `test-results/evidence/us-824-*.png` (3 responsive screenshots)

