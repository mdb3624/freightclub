# US-825: Carrier Search Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a carrier search form with inline results display that allows shippers to find available carriers by origin/destination location with optional equipment type filtering, maintaining dashboard context via single-page architecture.

**Architecture:** CarrierSearchPanel is a stateful component managing form input, search state (idle, loading, results, error, no-results). Results render inline within a scrollable container (max-height: 300px) using skeleton loaders during fetch. Component uses a custom `useCarrierSearch()` hook that wraps the existing `/api/v1/carriers/search` endpoint. Form validation is client-side (required fields); submission errors are handled gracefully.

**Tech Stack:** React 18 + TypeScript, React Hook Form + Zod validation, React Query for API calls, Tailwind CSS, custom SkeletonLoader component, data-testid for Playwright automation.

**HFD Spec Reference:** `docs/hfd/US-825_Carrier_Search_Panel_Design_Spec.md`

---

## File Structure

```
frontend/src/features/shipper/dashboard/
├── components/
│   ├── CarrierSearchPanel.tsx           [NEW] Stateful form + results component
│   ├── CarrierSearchPanel.test.tsx      [NEW] Unit + integration tests
│   ├── SkeletonLoader.tsx               [NEW] Reusable skeleton component
│   ├── CarrierResultRow.tsx             [NEW] Individual result card component
│   ├── CarrierResultRow.test.tsx        [NEW] Result row tests
│   ├── ShipperDashboardPage.tsx         [MODIFY] Integrate component
│   └── ...
├── hooks/
│   ├── useCarrierSearch.ts              [NEW] API call + error handling hook
│   └── useCarrierSearch.test.ts         [NEW] Hook tests
├── types/
│   └── carrier.ts                       [NEW] Carrier type definitions
└── styles/
    └── dashboard.css                    [MODIFY] Result row + form styling
```

---

## Task 1: Define Carrier Types

**Files:**
- Create: `frontend/src/features/shipper/dashboard/types/carrier.ts`

---

### Step 1.1: Create carrier type definitions

- [ ] **Create types file** `frontend/src/features/shipper/dashboard/types/carrier.ts`

```typescript
export interface Carrier {
  id: string;
  name: string;
  email: string;
  phone: string;
  rating: number; // 0-5 scale
  equipmentTypes: string[]; // ["Dry Van", "Flatbed", "Refrigerated"]
}

export interface CarrierSearchParams {
  origin: string; // City, State, or Zip
  destination: string; // City, State, or Zip
  equipment?: string; // Optional: equipment type filter
}

export interface CarrierSearchResult {
  carriers: Carrier[];
  count: number;
}

export interface CarrierSearchState {
  status: 'idle' | 'loading' | 'success' | 'error' | 'no-results';
  data: Carrier[];
  error: Error | null;
}
```

- [ ] **Commit**

```bash
cd frontend
git add src/features/shipper/dashboard/types/carrier.ts
git commit -m "types(US-825): add carrier and search types"
```

---

## Task 2: Create SkeletonLoader Component (Reusable)

**Files:**
- Create: `frontend/src/features/shipper/dashboard/components/SkeletonLoader.tsx`
- Test: `frontend/src/features/shipper/dashboard/components/SkeletonLoader.test.tsx`

---

### Step 2.1: Write test for SkeletonLoader

- [ ] **Create test file** `frontend/src/features/shipper/dashboard/components/SkeletonLoader.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import { SkeletonLoader } from './SkeletonLoader';

describe('SkeletonLoader', () => {
  it('renders skeleton loader with correct number of rows', () => {
    const { container } = render(<SkeletonLoader rowCount={3} />);
    const skeletonRows = container.querySelectorAll('.skeleton-row');
    expect(skeletonRows).toHaveLength(3);
  });

  it('applies correct CSS classes for animation', () => {
    const { container } = render(<SkeletonLoader rowCount={1} />);
    const skeletonRow = container.querySelector('.skeleton-row');
    expect(skeletonRow).toHaveClass('animate-pulse');
  });

  it('default rowCount is 3', () => {
    const { container } = render(<SkeletonLoader />);
    const skeletonRows = container.querySelectorAll('.skeleton-row');
    expect(skeletonRows).toHaveLength(3);
  });

  it('sets aria-busy true for accessibility', () => {
    const { container } = render(<SkeletonLoader />);
    expect(container.firstChild).toHaveAttribute('aria-busy', 'true');
  });
});
```

- [ ] **Run test to verify it fails**

```bash
cd frontend
npm run test -- SkeletonLoader.test.tsx --no-coverage
```

---

### Step 2.2: Implement SkeletonLoader component

- [ ] **Create component file** `frontend/src/features/shipper/dashboard/components/SkeletonLoader.tsx`

```typescript
import React from 'react';

interface SkeletonLoaderProps {
  rowCount?: number;
  rowHeight?: string; // e.g., "60px" for result rows, "40px" for form inputs
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  rowCount = 3,
  rowHeight = '60px',
}) => {
  return (
    <div aria-busy="true" className="space-y-2">
      {Array.from({ length: rowCount }).map((_, index) => (
        <div
          key={index}
          className="skeleton-row animate-pulse bg-gray-200 rounded"
          style={{ height: rowHeight }}
        />
      ))}
    </div>
  );
};
```

---

### Step 2.3: Run tests

- [ ] **Run test suite**

```bash
cd frontend
npm run test -- SkeletonLoader.test.tsx --no-coverage
```

Expected output: All tests pass (✓)

---

### Step 2.4: Commit component

- [ ] **Commit**

```bash
cd frontend
git add src/features/shipper/dashboard/components/SkeletonLoader.tsx
git add src/features/shipper/dashboard/components/SkeletonLoader.test.tsx
git commit -m "feat(US-825): add reusable SkeletonLoader component"
```

---

## Task 3: Create CarrierResultRow Component

**Files:**
- Create: `frontend/src/features/shipper/dashboard/components/CarrierResultRow.tsx`
- Test: `frontend/src/features/shipper/dashboard/components/CarrierResultRow.test.tsx`

---

### Step 3.1: Write test for CarrierResultRow

- [ ] **Create test file** `frontend/src/features/shipper/dashboard/components/CarrierResultRow.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CarrierResultRow } from './CarrierResultRow';
import { Carrier } from '../types/carrier';

describe('CarrierResultRow', () => {
  const mockCarrier: Carrier = {
    id: '1',
    name: 'ABC Trucking',
    email: 'contact@abctrucking.com',
    phone: '(555) 123-4567',
    rating: 4.8,
    equipmentTypes: ['Dry Van', 'Flatbed'],
  };

  it('renders carrier name', () => {
    render(<CarrierResultRow carrier={mockCarrier} onClick={jest.fn()} index={0} />);
    expect(screen.getByText('ABC Trucking')).toBeInTheDocument();
  });

  it('renders equipment types as comma-separated list', () => {
    render(<CarrierResultRow carrier={mockCarrier} onClick={jest.fn()} index={0} />);
    expect(screen.getByText(/Equipment: Dry Van, Flatbed/)).toBeInTheDocument();
  });

  it('renders rating and phone number', () => {
    render(<CarrierResultRow carrier={mockCarrier} onClick={jest.fn()} index={0} />);
    expect(screen.getByText(/Rating: 4\.8\/5/)).toBeInTheDocument();
    expect(screen.getByText(/\(555\) 123-4567/)).toBeInTheDocument();
  });

  it('calls onClick handler when row is clicked', async () => {
    const user = userEvent.setup();
    const mockOnClick = jest.fn();
    render(<CarrierResultRow carrier={mockCarrier} onClick={mockOnClick} index={0} />);

    const row = screen.getByTestId('carrier-result-0');
    await user.click(row);

    expect(mockOnClick).toHaveBeenCalledWith(mockCarrier);
  });

  it('has correct data-testid', () => {
    render(<CarrierResultRow carrier={mockCarrier} onClick={jest.fn()} index={2} />);
    expect(screen.getByTestId('carrier-result-2')).toBeInTheDocument();
  });

  it('is keyboard accessible (Enter activates row)', async () => {
    const user = userEvent.setup();
    const mockOnClick = jest.fn();
    render(<CarrierResultRow carrier={mockCarrier} onClick={mockOnClick} index={0} />);

    const row = screen.getByTestId('carrier-result-0');
    row.focus();
    await user.keyboard('{Enter}');

    expect(mockOnClick).toHaveBeenCalledWith(mockCarrier);
  });
});
```

- [ ] **Run test to verify it fails**

```bash
cd frontend
npm run test -- CarrierResultRow.test.tsx --no-coverage
```

---

### Step 3.2: Implement CarrierResultRow component

- [ ] **Create component file** `frontend/src/features/shipper/dashboard/components/CarrierResultRow.tsx`

```typescript
import React from 'react';
import { Carrier } from '../types/carrier';

interface CarrierResultRowProps {
  carrier: Carrier;
  onClick: (carrier: Carrier) => void;
  index: number;
}

export const CarrierResultRow: React.FC<CarrierResultRowProps> = ({
  carrier,
  onClick,
  index,
}) => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick(carrier);
    }
  };

  return (
    <div
      data-testid={`carrier-result-${index}`}
      role="button"
      tabIndex={0}
      onClick={() => onClick(carrier)}
      onKeyDown={handleKeyDown}
      className="p-3 border border-gray-200 rounded bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
    >
      <div className="text-sm font-bold text-gray-900">{carrier.name}</div>
      <div className="text-xs text-gray-600 mt-1">
        Equipment: {carrier.equipmentTypes.join(', ')}
      </div>
      <div className="text-xs text-gray-900 mt-1">
        Rating: {carrier.rating}/5 | {carrier.phone}
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
npm run test -- CarrierResultRow.test.tsx --no-coverage
```

Expected output: All tests pass (✓)

---

### Step 3.4: Commit component

- [ ] **Commit**

```bash
cd frontend
git add src/features/shipper/dashboard/components/CarrierResultRow.tsx
git add src/features/shipper/dashboard/components/CarrierResultRow.test.tsx
git commit -m "feat(US-825): add CarrierResultRow component with keyboard navigation"
```

---

## Task 4: Create useCarrierSearch Hook (API Integration)

**Files:**
- Create: `frontend/src/features/shipper/dashboard/hooks/useCarrierSearch.ts`
- Test: `frontend/src/features/shipper/dashboard/hooks/useCarrierSearch.test.ts`

---

### Step 4.1: Write test for useCarrierSearch hook

- [ ] **Create test file** `frontend/src/features/shipper/dashboard/hooks/useCarrierSearch.test.ts`

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { useCarrierSearch } from './useCarrierSearch';

// Mock axios (used by apiClient)
jest.mock('axios');

const mockCarrierData = [
  {
    id: '1',
    name: 'ABC Trucking',
    email: 'contact@abc.com',
    phone: '(555) 123-4567',
    rating: 4.8,
    equipmentTypes: ['Dry Van', 'Flatbed'],
  },
  {
    id: '2',
    name: 'XYZ Logistics',
    email: 'contact@xyz.com',
    phone: '(555) 987-6543',
    rating: 4.5,
    equipmentTypes: ['Refrigerated', 'Tanker'],
  },
];

describe('useCarrierSearch', () => {
  it('returns initial idle state', () => {
    const { result } = renderHook(() => useCarrierSearch());
    expect(result.current.status).toBe('idle');
    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('updates status to loading when search is called', async () => {
    const { result } = renderHook(() => useCarrierSearch());

    act(() => {
      result.current.search({ origin: 'New York', destination: 'Los Angeles' });
    });

    expect(result.current.status).toBe('loading');
  });

  it('returns carriers on successful search', async () => {
    const { result } = renderHook(() => useCarrierSearch());

    // Mock API response
    const mockApiCall = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ carriers: mockCarrierData }),
    } as Response);

    act(() => {
      result.current.search({
        origin: 'New York',
        destination: 'Los Angeles',
      });
    });

    await waitFor(() => {
      expect(result.current.status).toBe('success');
      expect(result.current.data).toEqual(mockCarrierData);
    });

    mockApiCall.mockRestore();
  });

  it('returns no-results status when API returns empty array', async () => {
    const { result } = renderHook(() => useCarrierSearch());

    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ carriers: [] }),
    } as Response);

    act(() => {
      result.current.search({
        origin: 'Invalid City',
        destination: 'Invalid State',
      });
    });

    await waitFor(() => {
      expect(result.current.status).toBe('no-results');
      expect(result.current.data).toEqual([]);
    });
  });

  it('returns error status on API failure', async () => {
    const { result } = renderHook(() => useCarrierSearch());

    jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    act(() => {
      result.current.search({
        origin: 'New York',
        destination: 'Los Angeles',
      });
    });

    await waitFor(() => {
      expect(result.current.status).toBe('error');
      expect(result.current.error).toBeDefined();
    });
  });

  it('accepts optional equipment parameter', async () => {
    const { result } = renderHook(() => useCarrierSearch());

    const mockFetch = jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ carriers: [mockCarrierData[0]] }),
      } as Response);

    act(() => {
      result.current.search({
        origin: 'New York',
        destination: 'Los Angeles',
        equipment: 'Dry Van',
      });
    });

    await waitFor(() => {
      // Verify API call includes equipment parameter
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('equipment=Dry%20Van')
      );
    });

    mockFetch.mockRestore();
  });

  it('reset() clears search results', async () => {
    const { result } = renderHook(() => useCarrierSearch());

    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ carriers: mockCarrierData }),
    } as Response);

    act(() => {
      result.current.search({
        origin: 'New York',
        destination: 'Los Angeles',
      });
    });

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.data).toEqual([]);
  });
});
```

- [ ] **Run test to verify it fails**

```bash
cd frontend
npm run test -- useCarrierSearch.test.ts --no-coverage
```

---

### Step 4.2: Implement useCarrierSearch hook

- [ ] **Create hook file** `frontend/src/features/shipper/dashboard/hooks/useCarrierSearch.ts`

```typescript
import { useState, useCallback } from 'react';
import { Carrier, CarrierSearchParams, CarrierSearchState } from '../types/carrier';

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
        `/api/v1/carriers/search?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      const carriers: Carrier[] = data.carriers || [];

      if (carriers.length === 0) {
        setState({ status: 'no-results', data: [], error: null });
      } else {
        setState({ status: 'success', data: carriers, error: null });
      }
    } catch (error) {
      setState({
        status: 'error',
        data: [],
        error: error instanceof Error ? error : new Error('Unknown error'),
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ status: 'idle', data: [], error: null });
  }, []);

  return {
    ...state,
    search,
    reset,
  };
};
```

---

### Step 4.3: Run tests

- [ ] **Run test suite**

```bash
cd frontend
npm run test -- useCarrierSearch.test.ts --no-coverage
```

Expected output: All tests pass (✓)

---

### Step 4.4: Commit hook

- [ ] **Commit**

```bash
cd frontend
git add src/features/shipper/dashboard/hooks/useCarrierSearch.ts
git add src/features/shipper/dashboard/hooks/useCarrierSearch.test.ts
git commit -m "feat(US-825): add useCarrierSearch hook with API integration"
```

---

## Task 5: Create CarrierSearchPanel Component (Stateful, TDD)

**Files:**
- Create: `frontend/src/features/shipper/dashboard/components/CarrierSearchPanel.tsx`
- Test: `frontend/src/features/shipper/dashboard/components/CarrierSearchPanel.test.tsx`

---

### Step 5.1: Write tests for CarrierSearchPanel

- [ ] **Create test file** `frontend/src/features/shipper/dashboard/components/CarrierSearchPanel.test.tsx`

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CarrierSearchPanel } from './CarrierSearchPanel';
import * as useCarrierSearchHook from '../hooks/useCarrierSearch';

jest.mock('../hooks/useCarrierSearch');

const mockUseCarrierSearch = useCarrierSearchHook.useCarrierSearch as jest.Mock;

describe('CarrierSearchPanel', () => {
  const mockCarrierData = [
    {
      id: '1',
      name: 'ABC Trucking',
      email: 'contact@abc.com',
      phone: '(555) 123-4567',
      rating: 4.8,
      equipmentTypes: ['Dry Van', 'Flatbed'],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCarrierSearch.mockReturnValue({
      status: 'idle',
      data: [],
      error: null,
      search: jest.fn(),
      reset: jest.fn(),
    });
  });

  it('renders form with origin and destination fields', () => {
    render(<CarrierSearchPanel />);

    expect(screen.getByLabelText(/Origin/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Destination/)).toBeInTheDocument();
    expect(screen.getByTestId('carrier-search-button')).toBeInTheDocument();
  });

  it('renders equipment type select field (optional)', () => {
    render(<CarrierSearchPanel />);

    expect(screen.getByLabelText(/Equipment Type/)).toBeInTheDocument();
  });

  it('validates that origin is required', async () => {
    const user = userEvent.setup();
    render(<CarrierSearchPanel />);

    const destinationInput = screen.getByLabelText(/Destination/);
    await user.type(destinationInput, 'Los Angeles');

    const submitButton = screen.getByTestId('carrier-search-button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Origin is required/)).toBeInTheDocument();
    });
  });

  it('validates that destination is required', async () => {
    const user = userEvent.setup();
    render(<CarrierSearchPanel />);

    const originInput = screen.getByLabelText(/Origin/);
    await user.type(originInput, 'New York');

    const submitButton = screen.getByTestId('carrier-search-button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Destination is required/)).toBeInTheDocument();
    });
  });

  it('submits form with valid origin and destination', async () => {
    const user = userEvent.setup();
    const mockSearch = jest.fn();
    mockUseCarrierSearch.mockReturnValue({
      status: 'idle',
      data: [],
      error: null,
      search: mockSearch,
      reset: jest.fn(),
    });

    render(<CarrierSearchPanel />);

    const originInput = screen.getByTestId('carrier-search-origin-input');
    const destinationInput = screen.getByTestId('carrier-search-destination-input');
    const submitButton = screen.getByTestId('carrier-search-button');

    await user.type(originInput, 'New York');
    await user.type(destinationInput, 'Los Angeles');
    await user.click(submitButton);

    expect(mockSearch).toHaveBeenCalledWith({
      origin: 'New York',
      destination: 'Los Angeles',
    });
  });

  it('displays skeleton loaders during loading state', () => {
    mockUseCarrierSearch.mockReturnValue({
      status: 'loading',
      data: [],
      error: null,
      search: jest.fn(),
      reset: jest.fn(),
    });

    const { container } = render(<CarrierSearchPanel />);

    expect(container.querySelector('.skeleton-row')).toBeInTheDocument();
  });

  it('displays search results when data is available', () => {
    mockUseCarrierSearch.mockReturnValue({
      status: 'success',
      data: mockCarrierData,
      error: null,
      search: jest.fn(),
      reset: jest.fn(),
    });

    render(<CarrierSearchPanel />);

    expect(screen.getByText('ABC Trucking')).toBeInTheDocument();
    expect(screen.getByTestId('carrier-result-0')).toBeInTheDocument();
  });

  it('displays no-results message when search returns empty', () => {
    mockUseCarrierSearch.mockReturnValue({
      status: 'no-results',
      data: [],
      error: null,
      search: jest.fn(),
      reset: jest.fn(),
    });

    render(<CarrierSearchPanel />);

    expect(screen.getByText(/No carriers found/)).toBeInTheDocument();
  });

  it('displays error message on API failure', () => {
    mockUseCarrierSearch.mockReturnValue({
      status: 'error',
      data: [],
      error: new Error('Network error'),
      search: jest.fn(),
      reset: jest.fn(),
    });

    render(<CarrierSearchPanel />);

    expect(screen.getByText(/Unable to search carriers/)).toBeInTheDocument();
  });

  it('renders with correct panel container attributes', () => {
    render(<CarrierSearchPanel />);

    const panel = screen.getByTestId('dashboard-carrier-search-panel');
    expect(panel).toHaveAttribute('role', 'region');
    expect(panel).toHaveAttribute('aria-label', 'Carrier Search');
  });

  it('calls onCarrierSelect when result row is clicked', async () => {
    const user = userEvent.setup();
    const mockOnSelect = jest.fn();
    mockUseCarrierSearch.mockReturnValue({
      status: 'success',
      data: mockCarrierData,
      error: null,
      search: jest.fn(),
      reset: jest.fn(),
    });

    render(<CarrierSearchPanel onCarrierSelect={mockOnSelect} />);

    const resultRow = screen.getByTestId('carrier-result-0');
    await user.click(resultRow);

    expect(mockOnSelect).toHaveBeenCalledWith(mockCarrierData[0]);
  });
});
```

- [ ] **Run test to verify it fails**

```bash
cd frontend
npm run test -- CarrierSearchPanel.test.tsx --no-coverage
```

---

### Step 5.2: Implement CarrierSearchPanel component

- [ ] **Create component file** `frontend/src/features/shipper/dashboard/components/CarrierSearchPanel.tsx`

```typescript
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCarrierSearch } from '../hooks/useCarrierSearch';
import { CarrierResultRow } from './CarrierResultRow';
import { SkeletonLoader } from './SkeletonLoader';
import { Carrier, CarrierSearchParams } from '../types/carrier';

const carrierSearchSchema = z.object({
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  equipment: z.string().optional(),
});

type CarrierSearchFormData = z.infer<typeof carrierSearchSchema>;

interface CarrierSearchPanelProps {
  onCarrierSelect?: (carrier: Carrier) => void;
}

export const CarrierSearchPanel: React.FC<CarrierSearchPanelProps> = ({
  onCarrierSelect,
}) => {
  const { status, data, error, search } = useCarrierSearch();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CarrierSearchFormData>({
    resolver: zodResolver(carrierSearchSchema),
  });

  const onSubmit = (formData: CarrierSearchFormData) => {
    const searchParams: CarrierSearchParams = {
      origin: formData.origin,
      destination: formData.destination,
      equipment: formData.equipment,
    };
    search(searchParams);
  };

  const handleResultClick = (carrier: Carrier) => {
    if (onCarrierSelect) {
      onCarrierSelect(carrier);
    }
  };

  return (
    <div
      data-testid="dashboard-carrier-search-panel"
      role="region"
      aria-label="Carrier Search"
      className="col-span-5 border border-widget rounded-md p-6 bg-white shadow-subtle"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        {/* Origin Field */}
        <div>
          <label htmlFor="origin" className="block text-sm font-bold text-gray-900 mb-1">
            Origin (required)
          </label>
          <input
            id="origin"
            type="text"
            placeholder="City, State or Zip"
            data-testid="carrier-search-origin-input"
            {...register('origin')}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-2 focus:border-bronze"
          />
          {errors.origin && (
            <span className="text-xs text-red-600 italic mt-1">{errors.origin.message}</span>
          )}
        </div>

        {/* Destination Field */}
        <div>
          <label htmlFor="destination" className="block text-sm font-bold text-gray-900 mb-1">
            Destination (required)
          </label>
          <input
            id="destination"
            type="text"
            placeholder="City, State or Zip"
            data-testid="carrier-search-destination-input"
            {...register('destination')}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-2 focus:border-bronze"
          />
          {errors.destination && (
            <span className="text-xs text-red-600 italic mt-1">
              {errors.destination.message}
            </span>
          )}
        </div>

        {/* Equipment Field */}
        <div>
          <label htmlFor="equipment" className="block text-sm font-bold text-gray-900 mb-1">
            Equipment Type (optional)
          </label>
          <select
            id="equipment"
            data-testid="carrier-search-equipment-select"
            {...register('equipment')}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-2 focus:border-bronze"
          >
            <option value="">Equipment Type (optional)</option>
            <option value="Dry Van">Dry Van</option>
            <option value="Flatbed">Flatbed</option>
            <option value="Refrigerated">Refrigerated</option>
            <option value="Tanker">Tanker</option>
            <option value="Box Truck">Box Truck</option>
            <option value="Sprinter Van">Sprinter Van</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          data-testid="carrier-search-button"
          className="w-full btn-bronze text-white font-medium py-2 rounded mt-3"
        >
          🔍 Find Carriers
        </button>
      </form>

      {/* Results Area */}
      <div
        data-testid="carrier-search-results"
        role="region"
        aria-label="Search Results"
        className="mt-4 max-h-80 overflow-auto border-t border-gray-200 pt-4"
      >
        {status === 'loading' && <SkeletonLoader rowCount={4} rowHeight="60px" />}

        {status === 'success' && data.length > 0 && (
          <div className="space-y-2">
            {data.map((carrier, index) => (
              <CarrierResultRow
                key={carrier.id}
                carrier={carrier}
                onClick={handleResultClick}
                index={index}
              />
            ))}
          </div>
        )}

        {status === 'no-results' && (
          <div className="text-center py-8">
            <div className="text-2xl mb-3">🔍</div>
            <div className="font-bold text-gray-600">No carriers found</div>
            <div className="text-sm text-gray-600 italic mt-1">
              Try adjusting your search parameters (different location or equipment type)
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center py-8">
            <div className="text-2xl mb-3">⚠️</div>
            <div className="text-sm text-red-600 italic">
              Unable to search carriers. Please try again.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
```

---

### Step 5.3: Run tests

- [ ] **Run test suite**

```bash
cd frontend
npm run test -- CarrierSearchPanel.test.tsx --no-coverage
```

Expected output: All tests pass (✓)

---

### Step 5.4: Commit component

- [ ] **Commit**

```bash
cd frontend
git add src/features/shipper/dashboard/components/CarrierSearchPanel.tsx
git add src/features/shipper/dashboard/components/CarrierSearchPanel.test.tsx
git commit -m "feat(US-825): add CarrierSearchPanel with form validation and inline results"
```

---

## Task 6: Integrate CarrierSearchPanel into ShipperDashboardPage

**Files:**
- Modify: `frontend/src/features/shipper/dashboard/ShipperDashboardPage.tsx`

---

### Step 6.1: Update ShipperDashboardPage

- [ ] **Modify** `frontend/src/features/shipper/dashboard/ShipperDashboardPage.tsx`

Find the row 3 placeholder section and replace CarrierSearchPanel placeholder:

**Before:**
```typescript
{/* Row 3: Carrier Search + Messages */}
<PlaceholderPanel
  testId="dashboard-carrier-search-panel"
  label="Carrier Search"
  colSpan={5}
/>
```

**After:**
```typescript
import { CarrierSearchPanel } from './components/CarrierSearchPanel';

// Inside render:
{/* Row 3: Carrier Search + Messages */}
<CarrierSearchPanel onCarrierSelect={(carrier) => {
  console.log('Carrier selected:', carrier);
  // Optional: navigate to carrier detail page or perform other action
}} />
```

---

### Step 6.2: Run integration test

- [ ] **Verify ShipperDashboardPage renders without errors**

```bash
cd frontend
npm run test -- ShipperDashboardPage.test.tsx --no-coverage
```

Expected output: Tests pass (✓)

---

### Step 6.3: Commit integration

- [ ] **Commit**

```bash
cd frontend
git add src/features/shipper/dashboard/ShipperDashboardPage.tsx
git commit -m "feat(US-825): integrate CarrierSearchPanel into dashboard grid"
```

---

## Task 7: Add E2E Test for Carrier Search Panel

**Files:**
- Create: `frontend/e2e/us-825-carrier-search.spec.ts`

---

### Step 7.1: Write E2E test

- [ ] **Create E2E test file** `frontend/e2e/us-825-carrier-search.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('US-825: Carrier Search Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/shipper');
    await page.waitForSelector('[data-testid="dashboard-carrier-search-panel"]');
  });

  test('renders form with all three fields', async ({ page }) => {
    expect(await page.getByLabel(/Origin/).isVisible()).toBeTruthy();
    expect(await page.getByLabel(/Destination/).isVisible()).toBeTruthy();
    expect(await page.getByLabel(/Equipment Type/).isVisible()).toBeTruthy();
    expect(await page.getByTestId('carrier-search-button').isVisible()).toBeTruthy();
  });

  test('form validation: requires origin', async ({ page }) => {
    await page.getByTestId('carrier-search-destination-input').fill('Los Angeles');
    await page.getByTestId('carrier-search-button').click();

    expect(await page.getByText(/Origin is required/).isVisible()).toBeTruthy();
  });

  test('form validation: requires destination', async ({ page }) => {
    await page.getByTestId('carrier-search-origin-input').fill('New York');
    await page.getByTestId('carrier-search-button').click();

    expect(await page.getByText(/Destination is required/).isVisible()).toBeTruthy();
  });

  test('displays skeleton loaders during search', async ({ page }) => {
    await page.getByTestId('carrier-search-origin-input').fill('New York');
    await page.getByTestId('carrier-search-destination-input').fill('Los Angeles');

    // Click search and verify skeleton loaders appear (before results load)
    const searchPromise = page.waitForSelector('.skeleton-row');
    await page.getByTestId('carrier-search-button').click();

    await searchPromise;
    expect(await page.locator('.skeleton-row').count()).toBeGreaterThan(0);
  });

  test('displays results after successful search', async ({ page }) => {
    // Mock API response
    await page.route('/api/v1/carriers/search*', (route) => {
      route.abort();
    });

    await page.getByTestId('carrier-search-origin-input').fill('New York');
    await page.getByTestId('carrier-search-destination-input').fill('Los Angeles');
    await page.getByTestId('carrier-search-button').click();

    // Verify no-results state appears (since API is mocked to fail)
    await page.waitForSelector('text=No carriers found');
    expect(await page.getByText(/No carriers found/).isVisible()).toBeTruthy();
  });

  test('displays error message on API failure', async ({ page }) => {
    // Mock API error
    await page.route('/api/v1/carriers/search*', (route) => {
      route.abort('failed');
    });

    await page.getByTestId('carrier-search-origin-input').fill('New York');
    await page.getByTestId('carrier-search-destination-input').fill('Los Angeles');
    await page.getByTestId('carrier-search-button').click();

    // Verify error state appears
    await page.waitForSelector('text=Unable to search carriers');
    expect(await page.getByText(/Unable to search carriers/).isVisible()).toBeTruthy();
  });

  test('equipment field is optional (search succeeds without it)', async ({ page }) => {
    await page.getByTestId('carrier-search-origin-input').fill('New York');
    await page.getByTestId('carrier-search-destination-input').fill('Los Angeles');
    // DO NOT fill equipment field

    // Click search - should not error
    const searchResponse = page.waitForResponse('/api/v1/carriers/search*');
    await page.getByTestId('carrier-search-button').click();

    // Verify request does not include equipment param (or includes empty value)
    const response = await searchResponse;
    expect(response.ok()).toBeTruthy();
  });

  test('captures responsive screenshots', async ({ page }) => {
    // Desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.screenshot({ path: 'test-results/evidence/us-825-carrier-search-desktop.png' });

    // Tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({ path: 'test-results/evidence/us-825-carrier-search-tablet.png' });

    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: 'test-results/evidence/us-825-carrier-search-mobile.png' });
  });
});
```

- [ ] **Run E2E test**

```bash
cd frontend
npm run test:e2e -- us-825-carrier-search.spec.ts
```

---

### Step 7.2: Commit E2E test

- [ ] **Commit**

```bash
cd frontend
git add e2e/us-825-carrier-search.spec.ts
git commit -m "test(US-825): add E2E test for carrier search panel (form validation, states, responsiveness)"
```

---

## Task 8: Responsive Mapping Verification

**Architectural Requirement:** Verify col-span-5 panel does NOT overflow at Tablet (768px) and Mobile (375px) breakpoints.

---

### Step 8.1: Verify responsive grid behavior

- [ ] **Check CSS Grid col-span in ShipperDashboardPage**

```bash
cd frontend
grep -A 2 "col-span-5" src/features/shipper/dashboard/ShipperDashboardPage.tsx
```

Expected: CarrierSearchPanel wrapper has `col-span-5` class.

- [ ] **Verify responsive col-span override in dashboard CSS**

```bash
cd frontend
grep -n "col-span" src/features/shipper/dashboard/styles/dashboard.css
```

Expected: No media queries override col-span-5. Grid col-spans are managed by US-823 parent grid.

---

### Step 8.2: Test responsive layout

- [ ] **Run responsive E2E test**

```bash
cd frontend
npm run test:e2e -- us-825-carrier-search.spec.ts -g "captures responsive"
```

Expected: Screenshots at 768px and 375px show results container scrollable within panel bounds, no horizontal overflow.

---

## Task 9: Final Verification

**Requirement:** Ensure mock data is NOT shipped in production build, and API endpoint is correctly called.

---

### Step 9.1: Verify no mock data in component

- [ ] **Check CarrierSearchPanel for hardcoded mock data**

```bash
cd frontend
grep -n "const mock\|const test\|mock.*Carrier\|test.*Carrier" src/features/shipper/dashboard/components/CarrierSearchPanel.tsx
```

Expected: No matches (no mock data in component).

---

### Step 9.2: Verify API endpoint is called

- [ ] **Check useCarrierSearch hook for correct API path**

```bash
cd frontend
grep -n "/api/v1/carriers/search" src/features/shipper/dashboard/hooks/useCarrierSearch.ts
```

Expected: One match showing correct endpoint URL.

---

### Step 9.3: Run full test suite

- [ ] **Run all tests for US-825 components and hooks**

```bash
cd frontend
npm run test -- CarrierSearchPanel useCarrierSearch CarrierResultRow SkeletonLoader --coverage --no-coverage-threshold
```

Expected output: All tests pass (✓); coverage ≥80% for components.

---

### Step 9.4: Final commit

- [ ] **Verify git status is clean**

```bash
cd frontend
git status
```

Expected: Working tree clean; all changes committed.

---

## Review Checklist (Before Sign-Off)

- [ ] All unit tests pass for CarrierSearchPanel, CarrierResultRow, SkeletonLoader
- [ ] All hook tests pass for useCarrierSearch
- [ ] Form validation tests pass (required/optional fields)
- [ ] All 6+ E2E tests pass (form validation, states, responsiveness, keyboard nav)
- [ ] Skeleton loaders appear during loading state
- [ ] No-results and error states display correctly
- [ ] Responsive layout verified at 3 breakpoints (no horizontal overflow)
- [ ] API endpoint `/api/v1/carriers/search` is called with correct params
- [ ] Equipment field is optional (search succeeds without it)
- [ ] No mock data in production build
- [ ] Screenshots captured at 3 breakpoints (1280px, 768px, 375px)
- [ ] Panel renders within col-span-5 grid slot (US-823 scaffold)
- [ ] Keyboard navigation works (Tab, Enter/Space, Arrow keys)
- [ ] WCAG AA accessibility verified (contrast, focus states, ARIA labels)

---

**Status:** READY_FOR_REVIEWER_GATE_SIGN_OFF

**Evidence Location:** `test-results/evidence/us-825-*.png` (3 responsive screenshots)

