import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useNavigate } from 'react-router-dom';
import { useQuickActionNavigation } from './useQuickActionNavigation';

// Mock React Router
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

describe('useQuickActionNavigation', () => {
  let mockNavigate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockNavigate = vi.fn();
    (useNavigate as ReturnType<typeof vi.fn>).mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return object with 4 handler functions', () => {
    const { result } = renderHook(() => useQuickActionNavigation());

    expect(result.current).toHaveProperty('onPostLoad');
    expect(result.current).toHaveProperty('onGetQuote');
    expect(result.current).toHaveProperty('onTrackShipments');
    expect(result.current).toHaveProperty('onPreferredCarriers');

    expect(typeof result.current.onPostLoad).toBe('function');
    expect(typeof result.current.onGetQuote).toBe('function');
    expect(typeof result.current.onTrackShipments).toBe('function');
    expect(typeof result.current.onPreferredCarriers).toBe('function');
  });

  it('onPostLoad should navigate to /shipper/loads/new', () => {
    const { result } = renderHook(() => useQuickActionNavigation());

    result.current.onPostLoad();

    expect(mockNavigate).toHaveBeenCalledWith('/shipper/loads/new');
  });

  it('onGetQuote should navigate to /shipper/quote', () => {
    const { result } = renderHook(() => useQuickActionNavigation());

    result.current.onGetQuote();

    expect(mockNavigate).toHaveBeenCalledWith('/shipper/quote');
  });

  it('onTrackShipments should navigate to /dashboard/shipper/loads', () => {
    const { result } = renderHook(() => useQuickActionNavigation());

    result.current.onTrackShipments();

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard/shipper/loads');
  });

  it('onPreferredCarriers should navigate to /settings/preferred-carriers', () => {
    const { result } = renderHook(() => useQuickActionNavigation());

    result.current.onPreferredCarriers();

    expect(mockNavigate).toHaveBeenCalledWith('/settings/preferred-carriers');
  });
});
