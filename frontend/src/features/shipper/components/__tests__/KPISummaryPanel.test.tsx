import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { KPISummaryPanel } from '../KPISummaryPanel';
import * as useKPISummaryHook from '@/features/shipper/hooks/useKPISummary';

// Mock the useKPISummary hook
vi.mock('@/features/shipper/hooks/useKPISummary');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('KPISummaryPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    vi.spyOn(useKPISummaryHook, 'useKPISummary').mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    render(<KPISummaryPanel />, { wrapper: Wrapper });

    expect(screen.getByTestId('kpi-summary-panel')).toBeInTheDocument();
    expect(screen.getByText('Business Health')).toBeInTheDocument();
  });

  it('renders metrics when data is available', () => {
    vi.spyOn(useKPISummaryHook, 'useKPISummary').mockReturnValue({
      data: {
        activeLoadCount: 5,
        onTimePercentage: 94.5,
        costPerMile: 2.45,
        isEmpty: false,
      },
      isLoading: false,
      error: null,
    } as any);

    render(<KPISummaryPanel />, { wrapper: Wrapper });

    expect(screen.getByTestId('kpi-tile-active-loads')).toBeInTheDocument();
    expect(screen.getByTestId('kpi-tile-ontime')).toBeInTheDocument();
    expect(screen.getByTestId('kpi-tile-cost-per-mile')).toBeInTheDocument();

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('94.5')).toBeInTheDocument();
    expect(screen.getByText('2.45')).toBeInTheDocument();
  });

  it('renders empty state when no delivered loads', () => {
    vi.spyOn(useKPISummaryHook, 'useKPISummary').mockReturnValue({
      data: {
        activeLoadCount: 0,
        onTimePercentage: null,
        costPerMile: null,
        isEmpty: true,
      },
      isLoading: false,
      error: null,
    } as any);

    render(<KPISummaryPanel />, { wrapper: Wrapper });

    expect(screen.getByTestId('kpi-summary-empty')).toBeInTheDocument();
    expect(screen.getByText('No Delivered Loads Yet')).toBeInTheDocument();
    expect(screen.getByTestId('kpi-empty-cta-button')).toBeInTheDocument();
  });

  it('renders error state when fetch fails', () => {
    vi.spyOn(useKPISummaryHook, 'useKPISummary').mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to fetch'),
    } as any);

    render(<KPISummaryPanel />, { wrapper: Wrapper });

    expect(screen.getByTestId('kpi-summary-error')).toBeInTheDocument();
    expect(screen.getByText('Failed to load KPI metrics')).toBeInTheDocument();
  });
});
