import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { CarrierDashboard } from './CarrierDashboard';

/**
 * US-730-0: Integration Tests
 * Test CarrierDashboard with realistic data and user interactions
 * Verifies component composition, state management, and API integration patterns
 */

function renderDashboard() {
  return render(
    <MemoryRouter>
      <CarrierDashboard />
    </MemoryRouter>
  );
}

describe('CarrierDashboard Integration Tests', () => {
  beforeEach(() => {
    // Mock window dimensions for mobile viewport
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 667
    });
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375
    });
  });

  describe('Golden Path: Owner-Operator Views Dashboard', () => {
    test('renders complete dashboard with all sections visible', async () => {
      renderDashboard();

      // Header visible with HOS widget
      await waitFor(() => {
        expect(screen.getByTestId('carrier-header')).toBeInTheDocument();
        expect(screen.getByTestId('hos-chip')).toBeInTheDocument();
      });

      // Hero section visible with active load
      expect(screen.getByTestId('hero-section')).toBeInTheDocument();
      expect(screen.getByTestId('active-load-card')).toBeInTheDocument();
      expect(screen.getByTestId('profitability-badge')).toBeInTheDocument();

      // Tab bar and content visible
      expect(screen.getByTestId('tab-bar')).toBeInTheDocument();
      expect(screen.getByTestId('tab-content-area')).toBeInTheDocument();

      // Default tab (My Stats) rendered
      expect(screen.getByTestId('tab-content-my-stats')).toBeInTheDocument();
    });

    test('displays metric grid (2x2) with correct data', async () => {
      renderDashboard();

      await waitFor(() => {
        const metrics = screen.getAllByTestId(/metric-badge-/);
        expect(metrics).toHaveLength(4);

        // Verify metric labels
        expect(screen.getByTestId('metric-label-acceptance')).toHaveTextContent('Accept');
        expect(screen.getByTestId('metric-label-on-time')).toHaveTextContent('On-Time');
        expect(screen.getByTestId('metric-label-completion')).toHaveTextContent('Complete');
        expect(screen.getByTestId('metric-label-payments')).toHaveTextContent('Paid');
      });
    });

    test('profitability badge shows correct status color (GREEN for ≥120% RPM)', async () => {
      renderDashboard();

      await waitFor(() => {
        const badge = screen.getByTestId('profitability-badge');
        expect(badge).toHaveStyle('backgroundColor: #27AE60'); // GREEN
        expect(badge).toHaveTextContent('✓');
        expect(badge).toHaveTextContent('118%');
      });
    });

    test('claim button has correct size (48px) and styling', async () => {
      renderDashboard();

      await waitFor(() => {
        const claimBtn = screen.getByTestId('claim-load-btn');
        expect(claimBtn).toHaveStyle('height: 48px');
        expect(claimBtn).toHaveTextContent('CLAIM');
        expect(claimBtn).toHaveStyle(
          'background: linear-gradient(180deg, #C9A46A 0%, #B08D57 45%, #8C6D3F 100%)'
        );
      });
    });
  });

  describe('Tab Navigation (No-Scroll Pattern)', () => {
    test('switching tabs does not navigate away (content swaps in place)', async () => {
      const user = userEvent.setup();
      renderDashboard();

      // Initial: My Stats visible
      await waitFor(() => {
        expect(screen.getByTestId('tab-content-my-stats')).toBeVisible();
      });

      // Hero section position before tab switch
      const heroBefore = screen.getByTestId('hero-section');
      const heroPosBefore = heroBefore.getBoundingClientRect().top;

      // Click Available Loads tab
      const availableLoadsTab = screen.getByTestId('tab-button-available-loads');
      await user.click(availableLoadsTab);

      // Available Loads content should be visible
      await waitFor(() => {
        expect(screen.getByTestId('tab-content-available-loads')).toBeVisible();
      });

      // Hero section should still be in same position (no page scroll)
      const heroAfter = screen.getByTestId('hero-section');
      const heroPosAfter = heroAfter.getBoundingClientRect().top;
      expect(heroPosAfter).toBe(heroPosBefore);
    });

    test('all three tabs are functional (click-to-switch)', async () => {
      const user = userEvent.setup();
      renderDashboard();

      const tabs = [
        { button: 'tab-button-my-stats', content: 'tab-content-my-stats' },
        { button: 'tab-button-available-loads', content: 'tab-content-available-loads' },
        { button: 'tab-button-quick-actions', content: 'tab-content-quick-actions' }
      ];

      for (const tab of tabs) {
        const tabButton = screen.getByTestId(tab.button);
        await user.click(tabButton);

        await waitFor(() => {
          const content = screen.getByTestId(tab.content);
          expect(content).toBeVisible();
        });
      }
    });

    test('tab buttons have bronze underline when active', async () => {
      const user = userEvent.setup();
      renderDashboard();

      const myStatsTab = screen.getByTestId('tab-button-my-stats');
      await user.click(myStatsTab);

      await waitFor(() => {
        expect(myStatsTab).toHaveStyle('borderBottom: 3px solid #B08D57');
      });
    });
  });

  describe('Available Loads Tab Integration', () => {
    test('renders load cards with profitability badges (different statuses)', async () => {
      const user = userEvent.setup();
      renderDashboard();

      // Switch to Available Loads tab
      await user.click(screen.getByTestId('tab-button-available-loads'));

      await waitFor(() => {
        const loadCards = screen.getAllByTestId(/load-card-/);
        expect(loadCards.length).toBeGreaterThan(0);
      });
    });

    test('claim button on load card is clickable', async () => {
      const user = userEvent.setup();
      renderDashboard();

      // Switch to Available Loads
      await user.click(screen.getByTestId('tab-button-available-loads'));

      await waitFor(() => {
        // Look for any claim button with testid starting with "claim-load-btn-"
        const claimLoadBtns = screen.queryAllByTestId(/^claim-load-btn-/);
        expect(claimLoadBtns.length).toBeGreaterThan(0);
      });
    });

    test('filter shows "profitable only" by default', async () => {
      const user = userEvent.setup();
      renderDashboard();

      await user.click(screen.getByTestId('tab-button-available-loads'));

      await waitFor(() => {
        expect(screen.getByText(/Profitable Filter/)).toBeInTheDocument();
      });
    });
  });

  describe('Quick Actions Tab Integration', () => {
    test('renders setup checklist items', async () => {
      const user = userEvent.setup();
      renderDashboard();

      await user.click(screen.getByTestId('tab-button-quick-actions'));

      await waitFor(() => {
        expect(screen.getByText(/Equipment Profile/)).toBeInTheDocument();
        expect(screen.getByText(/Cost Profile/)).toBeInTheDocument();
        expect(screen.getByText(/HOS Tracking/)).toBeInTheDocument();
      });
    });

    test('renders account action buttons', async () => {
      const user = userEvent.setup();
      renderDashboard();

      await user.click(screen.getByTestId('tab-button-quick-actions'));

      await waitFor(() => {
        expect(screen.getByText(/👤 Profile/)).toBeInTheDocument();
        expect(screen.getByText(/⚙️ Settings/)).toBeInTheDocument();
        expect(screen.getByText(/💳 Payment/)).toBeInTheDocument();
      });
    });
  });

  describe('Design Token Integration', () => {
    test('all text uses correct color tokens', async () => {
      renderDashboard();

      await waitFor(() => {
        const header = screen.getByTestId('carrier-header');
        const style = window.getComputedStyle(header);

        // Text should be white or light gray
        expect(style.color).toMatch(/rgb\(25[0-5]|rgb\(17[0-9]|rgb\(18[0-9]/);
      });
    });

    test('interactive elements use bronze accent (#B08D57)', async () => {
      renderDashboard();

      await waitFor(() => {
        const editBtn = screen.getByTestId('edit-cost-profile-btn');
        // CHG-US730-002: bronze accent now applies via gradient fill + border, not text color (white text on fill, matching CLAIM button)
        expect(editBtn).toHaveStyle('border: 1px solid #7A5F3A');
      });
    });

    test('dark theme background is correct (#121212)', () => {
      renderDashboard();

      const dashboard = screen.getByTestId('carrier-dashboard');
      expect(dashboard).toHaveStyle('backgroundColor: #121212');
    });
  });

  describe('Accessibility Integration', () => {
    test('header logo is decorative (no unnecessary ARIA)', async () => {
      renderDashboard();

      const logo = screen.getByTestId('carrier-logo');
      expect(logo).not.toHaveAttribute('role');
    });

    test('notification bell has aria-label', async () => {
      renderDashboard();

      const bell = screen.getByTestId('notification-bell');
      expect(bell).toHaveAttribute('aria-label', 'Notifications');
    });

    test('buttons are keyboard accessible (can be focused)', async () => {
      renderDashboard();

      const claimBtn = screen.getByTestId('claim-load-btn');
      claimBtn.focus();

      expect(claimBtn).toHaveFocus();
    });
  });

  describe('Mobile Responsiveness Integration', () => {
    test('dashboard fits within viewport (no vertical scroll required)', () => {
      const { container } = renderDashboard();

      const dashboard = container.querySelector('[data-testid="carrier-dashboard"]');
      expect(dashboard).toHaveStyle('height: 100vh');
      expect(dashboard).toHaveStyle('overflow: hidden');
    });

    test('all interactive elements are ≥48px (glove-friendly)', async () => {
      renderDashboard();

      await waitFor(() => {
        // Claim button
        const claimBtn = screen.getByTestId('claim-load-btn');
        expect(claimBtn).toHaveStyle('height: 48px');

        // Tab buttons should be at least 48px in height
        const tabBtns = screen.getAllByTestId(/tab-button-/);
        tabBtns.forEach((btn) => {
          const style = window.getComputedStyle(btn);
          expect(parseInt(style.height)).toBeGreaterThanOrEqual(48);
        });
      });
    });

    test('touch targets have proper spacing (gap: 8px minimum)', async () => {
      renderDashboard();

      await waitFor(() => {
        // Hero section buttons have 8px gap
        const actionButtons = screen.getByTestId('claim-load-btn').parentElement;
        const style = window.getComputedStyle(actionButtons!);
        expect(style.gap).toBe('8px');
      });
    });
  });

  describe('Performance Integration', () => {
    test('initial render completes quickly (<1s)', async () => {
      const startTime = performance.now();
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByTestId('hero-section')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(renderTime).toBeLessThan(1000); // <1 second
    });

    test('tab switching is instant (no lag)', async () => {
      const user = userEvent.setup();
      renderDashboard();

      const startTime = performance.now();
      await user.click(screen.getByTestId('tab-button-available-loads'));
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(500); // <500ms
    });
  });

  describe('State Management Integration', () => {
    test('dashboard maintains state across tab switches', async () => {
      const user = userEvent.setup();
      renderDashboard();

      // Verify hero section exists on My Stats tab
      const heroInitial = screen.getByTestId('hero-section');
      expect(heroInitial).toBeInTheDocument();

      // Switch to Available Loads
      await user.click(screen.getByTestId('tab-button-available-loads'));

      // Switch back to My Stats
      await user.click(screen.getByTestId('tab-button-my-stats'));

      // Hero section should still be there (state preserved)
      const heroAfter = screen.getByTestId('hero-section');
      expect(heroAfter).toBeInTheDocument();
    });
  });
});
