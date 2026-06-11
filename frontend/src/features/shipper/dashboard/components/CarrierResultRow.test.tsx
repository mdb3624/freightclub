import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { CarrierResultRow } from './CarrierResultRow';
import { Carrier } from '../types/carrier';

describe('CarrierResultRow', () => {
  const mockCarrier: Carrier = {
    id: 'carrier-123',
    name: 'ABC Trucking Company',
    email: 'contact@abctrucking.com',
    phone: '(555) 123-4567',
    rating: 4.8,
    equipmentTypes: ['Dry Van', 'Flatbed', 'Refrigerated'],
  };

  it('renders carrier name', () => {
    const mockOnClick = vi.fn();
    render(
      <CarrierResultRow
        carrier={mockCarrier}
        onClick={mockOnClick}
        index={0}
      />
    );

    expect(screen.getByText('ABC Trucking Company')).toBeInTheDocument();
  });

  it('renders equipment types as comma-separated list', () => {
    const mockOnClick = vi.fn();
    render(
      <CarrierResultRow
        carrier={mockCarrier}
        onClick={mockOnClick}
        index={0}
      />
    );

    expect(screen.getByText('Equipment: Dry Van, Flatbed, Refrigerated')).toBeInTheDocument();
  });

  it('renders rating and phone number', () => {
    const mockOnClick = vi.fn();
    render(
      <CarrierResultRow
        carrier={mockCarrier}
        onClick={mockOnClick}
        index={0}
      />
    );

    expect(screen.getByText('Rating: 4.8/5 | (555) 123-4567')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', async () => {
    const user = userEvent.setup();
    const mockOnClick = vi.fn();

    render(
      <CarrierResultRow
        carrier={mockCarrier}
        onClick={mockOnClick}
        index={0}
      />
    );

    const row = screen.getByTestId('carrier-result-row-0');
    await user.click(row);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
    expect(mockOnClick).toHaveBeenCalledWith(mockCarrier);
  });

  it('is keyboard accessible with Enter key', async () => {
    const user = userEvent.setup();
    const mockOnClick = vi.fn();

    render(
      <CarrierResultRow
        carrier={mockCarrier}
        onClick={mockOnClick}
        index={0}
      />
    );

    const row = screen.getByTestId('carrier-result-row-0');
    row.focus();
    await user.keyboard('{Enter}');

    expect(mockOnClick).toHaveBeenCalledTimes(1);
    expect(mockOnClick).toHaveBeenCalledWith(mockCarrier);
  });

  it('is keyboard accessible with Space key', async () => {
    const user = userEvent.setup();
    const mockOnClick = vi.fn();

    render(
      <CarrierResultRow
        carrier={mockCarrier}
        onClick={mockOnClick}
        index={0}
      />
    );

    const row = screen.getByTestId('carrier-result-row-0');
    row.focus();
    await user.keyboard(' ');

    expect(mockOnClick).toHaveBeenCalledTimes(1);
    expect(mockOnClick).toHaveBeenCalledWith(mockCarrier);
  });

  it('has correct data-testid with index', () => {
    const mockOnClick = vi.fn();

    render(
      <CarrierResultRow
        carrier={mockCarrier}
        onClick={mockOnClick}
        index={5}
      />
    );

    expect(screen.getByTestId('carrier-result-row-5')).toBeInTheDocument();
  });

  it('has hover state styling', () => {
    const mockOnClick = vi.fn();

    render(
      <CarrierResultRow
        carrier={mockCarrier}
        onClick={mockOnClick}
        index={0}
      />
    );

    const row = screen.getByTestId('carrier-result-row-0');
    expect(row).toHaveClass('hover:bg-blue-50');
  });

  it('has proper role and aria attributes for accessibility', () => {
    const mockOnClick = vi.fn();

    render(
      <CarrierResultRow
        carrier={mockCarrier}
        onClick={mockOnClick}
        index={0}
      />
    );

    const row = screen.getByTestId('carrier-result-row-0');
    expect(row).toHaveAttribute('role', 'button');
    expect(row).toHaveAttribute('tabindex', '0');
  });

  it('renders different equipment types correctly', () => {
    const mockOnClick = vi.fn();
    const carrierWithDifferentEquipment: Carrier = {
      ...mockCarrier,
      equipmentTypes: ['Tanker', 'Container'],
    };

    render(
      <CarrierResultRow
        carrier={carrierWithDifferentEquipment}
        onClick={mockOnClick}
        index={0}
      />
    );

    expect(screen.getByText('Equipment: Tanker, Container')).toBeInTheDocument();
  });

  it('renders different ratings correctly', () => {
    const mockOnClick = vi.fn();
    const carrierWithDifferentRating: Carrier = {
      ...mockCarrier,
      rating: 3.5,
    };

    render(
      <CarrierResultRow
        carrier={carrierWithDifferentRating}
        onClick={mockOnClick}
        index={0}
      />
    );

    expect(screen.getByText('Rating: 3.5/5 | (555) 123-4567')).toBeInTheDocument();
  });
});
