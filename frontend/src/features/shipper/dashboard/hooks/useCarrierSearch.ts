import { useState, useCallback } from 'react';
import { Carrier, CarrierSearchParams, CarrierSearchState } from '../types/carrier';

/**
 * US-825 Task 4: Hook for searching carriers with filtering
 * Manages API calls and state for the Carrier Search Panel
 */
export const useCarrierSearch = () => {
  const [state, setState] = useState<CarrierSearchState>({
    status: 'idle',
    data: [],
    error: null,
  });

  const search = useCallback(async (params: CarrierSearchParams) => {
    setState({ status: 'loading', data: [], error: null });

    try {
      const queryParams = new URLSearchParams({
        origin: params.origin,
        destination: params.destination,
        ...(params.equipment && { equipment: params.equipment }),
      });

      const response = await fetch(
        `/api/v1/carriers/search?${queryParams}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const data = await response.json();
      const carriers = data.carriers || [];

      if (carriers.length === 0) {
        setState({ status: 'no-results', data: [], error: null });
      } else {
        setState({ status: 'success', data: carriers, error: null });
      }
    } catch (error) {
      setState({
        status: 'error',
        data: [],
        error:
          error instanceof Error ? error : new Error('Unknown error'),
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ status: 'idle', data: [], error: null });
  }, []);

  return { ...state, search, reset };
};
