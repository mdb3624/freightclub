import { render, screen } from '@testing-library/react';
import { SkeletonLoader } from './SkeletonLoader';

/**
 * Feature: US-825 (Carrier Search Panel)
 * AC-1: Loading state displays skeleton placeholders
 */

describe('SkeletonLoader', () => {
  test('US-825 AC-1: renders default skeleton loader with 3 rows', () => {
    render(<SkeletonLoader />);
    const skeletonRows = screen.getAllByRole('presentation', { hidden: true });
    expect(skeletonRows).toHaveLength(3);
  });

  test('renders skeleton loader with custom row count', () => {
    render(<SkeletonLoader rowCount={5} />);
    const skeletonRows = screen.getAllByRole('presentation', { hidden: true });
    expect(skeletonRows).toHaveLength(5);
  });

  test('applies animate-pulse and bg-gray-200 CSS classes', () => {
    render(<SkeletonLoader rowCount={1} />);
    const skeletonRow = screen.getByRole('presentation', { hidden: true });
    expect(skeletonRow).toHaveClass('animate-pulse', 'bg-gray-200');
  });

  test('sets aria-busy="true" for accessibility', () => {
    const { container } = render(<SkeletonLoader />);
    const loaderContainer = container.firstChild;
    expect(loaderContainer).toHaveAttribute('aria-busy', 'true');
  });

  test('applies default rowHeight of 60px via style', () => {
    render(<SkeletonLoader rowCount={1} />);
    const skeletonRow = screen.getByRole('presentation', { hidden: true });
    expect(skeletonRow).toHaveStyle({ height: '60px' });
  });

  test('applies custom rowHeight via style', () => {
    render(<SkeletonLoader rowCount={1} rowHeight="40px" />);
    const skeletonRow = screen.getByRole('presentation', { hidden: true });
    expect(skeletonRow).toHaveStyle({ height: '40px' });
  });

  test('includes space-y-2 for vertical spacing', () => {
    const { container } = render(<SkeletonLoader />);
    const loaderContainer = container.firstChild;
    expect(loaderContainer).toHaveClass('space-y-2');
  });

  test('includes rounded class for border radius', () => {
    render(<SkeletonLoader rowCount={1} />);
    const skeletonRow = screen.getByRole('presentation', { hidden: true });
    expect(skeletonRow).toHaveClass('rounded');
  });
});
