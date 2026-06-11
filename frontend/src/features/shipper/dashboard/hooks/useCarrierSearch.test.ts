import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useCarrierSearch } from './useCarrierSearch';
import { Carrier } from '../types/carrier';

describe('useCarrierSearch', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial idle state', () => {
    const { result } = renderHook(() => useCarrierSearch());

    expect(result.current.status).toBe('idle');
    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should update status to loading when search called', () => {
    const mockCarriers: Carrier[] = [
      {
        id: '1',
        name: 'Carrier A',
        email: 'carrier@a.com',
        phone: '555-0001',
        rating: 4.5,
        equipmentTypes: ['Dry Van'],
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      json: async () => ({ carriers: mockCarriers }),
    });

    const { result } = renderHook(() => useCarrierSearch());

    act(() => {
      result.current.search({
        origin: 'Los Angeles, CA',
        destination: 'San Francisco, CA',
      });
    });

    // Should be loading immediately after search call
    expect(result.current.status).toBe('loading');
  });

  it('should return carriers on success', async () => {
    const mockCarriers: Carrier[] = [
      {
        id: '1',
        name: 'Carrier A',
        email: 'carrier@a.com',
        phone: '555-0001',
        rating: 4.5,
        equipmentTypes: ['Dry Van'],
      },
      {
        id: '2',
        name: 'Carrier B',
        email: 'carrier@b.com',
        phone: '555-0002',
        rating: 4.0,
        equipmentTypes: ['Flatbed'],
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      json: async () => ({ carriers: mockCarriers }),
    });

    const { result } = renderHook(() => useCarrierSearch());

    act(() => {
      result.current.search({
        origin: 'Los Angeles, CA',
        destination: 'San Francisco, CA',
      });
    });

    await waitFor(() => {
      expect(result.current.status).toBe('success');
      expect(result.current.data).toEqual(mockCarriers);
      expect(result.current.error).toBeNull();
    });
  });

  it('should return no-results when empty array received', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      json: async () => ({ carriers: [] }),
    });

    const { result } = renderHook(() => useCarrierSearch());

    act(() => {
      result.current.search({
        origin: 'Los Angeles, CA',
        destination: 'San Francisco, CA',
      });
    });

    await waitFor(() => {
      expect(result.current.status).toBe('no-results');
      expect(result.current.data).toEqual([]);
      expect(result.current.error).toBeNull();
    });
  });

  it('should return error status on API failure', async () => {
    const mockError = new Error('Network error');
    (global.fetch as any).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useCarrierSearch());

    act(() => {
      result.current.search({
        origin: 'Los Angeles, CA',
        destination: 'San Francisco, CA',
      });
    });

    await waitFor(() => {
      expect(result.current.status).toBe('error');
      expect(result.current.data).toEqual([]);
      expect(result.current.error).toEqual(mockError);
    });
  });

  it('should accept optional equipment parameter', async () => {
    const mockCarriers: Carrier[] = [
      {
        id: '1',
        name: 'Carrier A',
        email: 'carrier@a.com',
        phone: '555-0001',
        rating: 4.5,
        equipmentTypes: ['Refrigerated'],
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      json: async () => ({ carriers: mockCarriers }),
    });

    const { result } = renderHook(() => useCarrierSearch());

    act(() => {
      result.current.search({
        origin: 'Los Angeles, CA',
        destination: 'San Francisco, CA',
        equipment: 'Refrigerated',
      });
    });

    await waitFor(() => {
      expect(result.current.status).toBe('success');
      expect(result.current.data).toEqual(mockCarriers);
    });

    // Verify fetch was called with equipment parameter
    const fetchCall = (global.fetch as any).mock.calls[0][0];
    expect(fetchCall).toContain('equipment=Refrigerated');
  });

  it('should reset state when reset() is called', async () => {
    const mockCarriers: Carrier[] = [
      {
        id: '1',
        name: 'Carrier A',
        email: 'carrier@a.com',
        phone: '555-0001',
        rating: 4.5,
        equipmentTypes: ['Dry Van'],
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      json: async () => ({ carriers: mockCarriers }),
    });

    const { result } = renderHook(() => useCarrierSearch());

    // Perform search
    act(() => {
      result.current.search({
        origin: 'Los Angeles, CA',
        destination: 'San Francisco, CA',
      });
    });

    await waitFor(() => {
      expect(result.current.status).toBe('success');
      expect(result.current.data).toHaveLength(1);
    });

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should construct correct URL with all query parameters', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      json: async () => ({ carriers: [] }),
    });

    const { result } = renderHook(() => useCarrierSearch());

    act(() => {
      result.current.search({
        origin: 'Los Angeles, CA',
        destination: 'San Francisco, CA',
        equipment: 'Dry Van',
      });
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    const fetchUrl = (global.fetch as any).mock.calls[0][0];
    expect(fetchUrl).toContain('/api/v1/carriers/search');
    expect(fetchUrl).toContain('origin=Los+Angeles%2C+CA');
    expect(fetchUrl).toContain('destination=San+Francisco%2C+CA');
    expect(fetchUrl).toContain('equipment=Dry+Van');
  });

  it('should not include equipment in URL when not provided', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      json: async () => ({ carriers: [] }),
    });

    const { result } = renderHook(() => useCarrierSearch());

    act(() => {
      result.current.search({
        origin: 'Los Angeles, CA',
        destination: 'San Francisco, CA',
      });
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    const fetchUrl = (global.fetch as any).mock.calls[0][0];
    expect(fetchUrl).toContain('/api/v1/carriers/search');
    expect(fetchUrl).toContain('origin=');
    expect(fetchUrl).toContain('destination=');
    expect(fetchUrl).not.toContain('equipment');
  });

  it('should handle non-Error exception objects', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce('string error');

    const { result } = renderHook(() => useCarrierSearch());

    act(() => {
      result.current.search({
        origin: 'Los Angeles, CA',
        destination: 'San Francisco, CA',
      });
    });

    await waitFor(() => {
      expect(result.current.status).toBe('error');
      expect(result.current.error).toEqual(new Error('Unknown error'));
    });
  });
});
