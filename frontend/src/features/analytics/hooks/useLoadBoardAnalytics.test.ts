import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAdminAnalytics, useShipperAnalytics } from './useLoadBoardAnalytics';
import { apiClient } from '@/api/apiClient';

vi.mock('@/api/apiClient');

describe('useLoadBoardAnalytics', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  describe('useAdminAnalytics', () => {
    it('should fetch admin analytics for specified range', async () => {
      const mockData = {
        totalPosted: 100,
        totalClaimed: 50,
        claimPercentage: 50,
        avgClaimTimeHours: 2.5,
      };

      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const { result } = renderHook(() => useAdminAnalytics(7), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
    });

    it('should use default range of 7 days', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: {
          totalPosted: 100,
          totalClaimed: 50,
          claimPercentage: 50,
          avgClaimTimeHours: 2.5,
        },
      });

      renderHook(() => useAdminAnalytics(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
      });

      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalledWith(
          '/api/v1/admin/analytics/load-board',
          expect.objectContaining({
            params: { range: 7 },
          })
        );
      });
    });
  });

  describe('useShipperAnalytics', () => {
    it('should fetch shipper analytics with correct parameters', async () => {
      const mockData = {
        postedCount: 50,
        claimedCount: 25,
        claimPercentage: 50,
        avgClaimTimeHours: 1.5,
      };

      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const { result } = renderHook(
        () => useShipperAnalytics('shipper-123', 30),
        {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          ),
        }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('API Error');
      vi.mocked(apiClient.get).mockRejectedValueOnce(error);

      const { result } = renderHook(() => useAdminAnalytics(7), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });
});
