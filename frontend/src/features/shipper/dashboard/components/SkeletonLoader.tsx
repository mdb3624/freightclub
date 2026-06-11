/**
 * SkeletonLoader Component
 * Reusable skeleton placeholder for loading states
 *
 * Feature: US-825 (Carrier Search Panel)
 * AC-1: Loading state displays skeleton placeholders
 */

import React from 'react';

interface SkeletonLoaderProps {
  rowCount?: number; // default: 3
  rowHeight?: string; // e.g., "60px" for result rows, "40px" for inputs
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
          role="presentation"
          className="skeleton-row animate-pulse bg-gray-200 rounded"
          style={{ height: rowHeight }}
        />
      ))}
    </div>
  );
};
