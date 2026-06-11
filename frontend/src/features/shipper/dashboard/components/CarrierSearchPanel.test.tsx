import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CarrierSearchPanel } from './CarrierSearchPanel';
import { useCarrierSearch } from '../hooks/useCarrierSearch';
import { Carrier } from '../types/carrier';

// Mock the useCarrierSearch hook
vi.mock('../hooks/useCarrierSearch');

const mockCarrier: Carrier = {
  id: 'carrier-1',
  name: 'ABC Logistics',
  email: 'abc@logistics.com',
  phone: '555-1234',
  rating: 4.5,
  equipmentTypes: ['Dry Van', 'Flatbed'],
};

const mockUseCarrierSearch = useCarrierSearch as ReturnType<typeof vi.fn>;

describe('CarrierSearchPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCarrierSearch.mockReturnValue({
      status: 'idle',
      data: [],
      error: null,
      search: vi.fn(),
      reset: vi.fn(),
    });
  });

  it('renders form with origin, destination, and equipment fields', () => {
    render(<CarrierSearchPanel />);

    expect(screen.getByTestId('carrier-search-origin')).toBeInTheDocument();
    expect(screen.getByTestId('carrier-search-destination')).toBeInTheDocument();
    expect(screen.getByTestId('carrier-search-equipment')).toBeInTheDocument();
  });

  it('renders Find Carriers submit button', () => {
    render(<CarrierSearchPanel />);

    expect(screen.getByTestId('carrier-search-submit-btn')).toHaveTextContent('Find Carriers');
  });

  it('validates that origin is required', async () => {
    const user = userEvent.setup();
    render(<CarrierSearchPanel />);

    const submitBtn = screen.getByTestId('carrier-search-submit-btn');
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Origin is required')).toBeInTheDocument();
    });
  });

  it('validates that destination is required', async () => {
    const user = userEvent.setup();
    render(<CarrierSearchPanel />);

    const submitBtn = screen.getByTestId('carrier-search-submit-btn');
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Destination is required')).toBeInTheDocument();
    });
  });

  it('allows equipment field to be optional', async () => {
    const user = userEvent.setup();
    const mockSearch = vi.fn();
    mockUseCarrierSearch.mockReturnValue({
      status: 'idle',
      data: [],
      error: null,
      search: mockSearch,
      reset: vi.fn(),
    });

    render(<CarrierSearchPanel />);

    const originInput = screen.getByTestId('carrier-search-origin');
    const destinationInput = screen.getByTestId('carrier-search-destination');
    const submitBtn = screen.getByTestId('carrier-search-submit-btn');

    await user.type(originInput, 'New York');
    await user.type(destinationInput, 'Los Angeles');
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          origin: 'New York',
          destination: 'Los Angeles',
        })
      );
    });
  });

  it('submits form with valid data and calls search hook', async () => {
    const user = userEvent.setup();
    const mockSearch = vi.fn();
    mockUseCarrierSearch.mockReturnValue({
      status: 'idle',
      data: [],
      error: null,
      search: mockSearch,
      reset: vi.fn(),
    });

    render(<CarrierSearchPanel />);

    const originInput = screen.getByTestId('carrier-search-origin');
    const destinationInput = screen.getByTestId('carrier-search-destination');
    const submitBtn = screen.getByTestId('carrier-search-submit-btn');

    await user.type(originInput, 'New York');
    await user.type(destinationInput, 'Los Angeles');
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          origin: 'New York',
          destination: 'Los Angeles',
        })
      );
    });
  });

  it('displays skeleton loaders during loading state', () => {
    mockUseCarrierSearch.mockReturnValue({
      status: 'loading',
      data: [],
      error: null,
      search: vi.fn(),
      reset: vi.fn(),
    });

    render(<CarrierSearchPanel />);

    const skeletonRows = screen.getAllByRole('presentation');
    expect(skeletonRows.length).toBeGreaterThan(0);
  });

  it('displays carrier result rows on success', () => {
    mockUseCarrierSearch.mockReturnValue({
      status: 'success',
      data: [mockCarrier],
      error: null,
      search: vi.fn(),
      reset: vi.fn(),
    });

    render(<CarrierSearchPanel />);

    expect(screen.getByTestId('carrier-result-row-0')).toBeInTheDocument();
    expect(screen.getByText(mockCarrier.name)).toBeInTheDocument();
  });

  it('displays "No carriers found" message on no-results', () => {
    mockUseCarrierSearch.mockReturnValue({
      status: 'no-results',
      data: [],
      error: null,
      search: vi.fn(),
      reset: vi.fn(),
    });

    render(<CarrierSearchPanel />);

    expect(screen.getByText('No carriers found for your search.')).toBeInTheDocument();
  });

  it('displays error message on API failure', () => {
    const mockError = new Error('API Error');
    mockUseCarrierSearch.mockReturnValue({
      status: 'error',
      data: [],
      error: mockError,
      search: vi.fn(),
      reset: vi.fn(),
    });

    render(<CarrierSearchPanel />);

    expect(screen.getByText('Error searching for carriers. Please try again.')).toBeInTheDocument();
  });

  it('calls onCarrierSelect when result is clicked', async () => {
    const user = userEvent.setup();
    const mockOnSelect = vi.fn();
    mockUseCarrierSearch.mockReturnValue({
      status: 'success',
      data: [mockCarrier],
      error: null,
      search: vi.fn(),
      reset: vi.fn(),
    });

    render(<CarrierSearchPanel onCarrierSelect={mockOnSelect} />);

    const resultRow = screen.getByTestId('carrier-result-row-0');
    await user.click(resultRow);

    expect(mockOnSelect).toHaveBeenCalledWith(mockCarrier);
  });

  it('renders panel with correct grid class and data-testid', () => {
    render(<CarrierSearchPanel />);

    const panel = screen.getByTestId('dashboard-carrier-search-panel');
    expect(panel).toHaveClass('col-span-5');
  });

  it('renders panel with correct accessibility attributes', () => {
    render(<CarrierSearchPanel />);

    const panel = screen.getByTestId('dashboard-carrier-search-panel');
    expect(panel).toHaveAttribute('role', 'region');
    expect(panel).toHaveAttribute('aria-label', 'Carrier Search');
  });

  it('displays equipment options in select', async () => {
    render(<CarrierSearchPanel />);

    expect(screen.getByText('Dry Van')).toBeInTheDocument();
    expect(screen.getByText('Flatbed')).toBeInTheDocument();
    expect(screen.getByText('Refrigerated')).toBeInTheDocument();
    expect(screen.getByText('Tanker')).toBeInTheDocument();
    expect(screen.getByText('Box Truck')).toBeInTheDocument();
    expect(screen.getByText('Sprinter Van')).toBeInTheDocument();
  });
});
