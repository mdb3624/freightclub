/**
 * Feature: US-823 (Shipper Dashboard Layout Skeleton)
 * AC-4: Empty State UX (Phase 4)
 *
 * Test: EmptyStateCard component renders user-friendly messaging
 */

import { render, screen } from '@testing-library/react';
import { Package } from 'lucide-react';
import { EmptyStateCard } from './EmptyStateCard';

describe('EmptyStateCard', () => {
  it('renders icon, title, and description', () => {
    render(
      <EmptyStateCard
        icon={<Package size={40} />}
        title="No Shipments"
        description="Start by posting a load."
        testId="empty-test"
      />
    );

    expect(screen.getByTestId('empty-test')).toBeInTheDocument();
    expect(screen.getByText('No Shipments')).toBeInTheDocument();
    expect(screen.getByText('Start by posting a load.')).toBeInTheDocument();
  });

  it('renders action button when provided', () => {
    const handleClick = jest.fn();
    render(
      <EmptyStateCard
        icon={<Package size={40} />}
        title="No Shipments"
        description="Start by posting a load."
        action={{ label: 'Post Load', onClick: handleClick }}
        testId="empty-test"
      />
    );

    const button = screen.getByTestId('empty-test-action-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Post Load');
  });

  it('does not render button when action is not provided', () => {
    render(
      <EmptyStateCard
        icon={<Package size={40} />}
        title="No Shipments"
        description="Start by posting a load."
        testId="empty-test"
      />
    );

    expect(screen.queryByTestId('empty-test-action-button')).not.toBeInTheDocument();
  });

  it('applies token-based styling', () => {
    const { container } = render(
      <EmptyStateCard
        icon={<Package size={40} />}
        title="No Shipments"
        description="Start by posting a load."
        testId="empty-test"
      />
    );

    const emptyStateDiv = screen.getByTestId('empty-test');
    const styles = window.getComputedStyle(emptyStateDiv);

    // Verify flexbox layout
    expect(emptyStateDiv).toHaveClass('flex flex-col items-center justify-center');
  });
});
