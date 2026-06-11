/**
 * US-823: Empty State Card Component
 * Displays user-friendly messaging when a section has no data
 *
 * Props:
 * - icon: Icon component (lucide-react)
 * - title: Section title
 * - description: Contextual message
 * - action?: Optional CTA button
 */

import React from 'react';

interface EmptyStateCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  testId?: string;
}

export const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  icon,
  title,
  description,
  action,
  testId,
}) => {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 py-8"
      style={{
        padding: 'var(--space-lg)',
      }}
      data-testid={testId}
    >
      {/* Icon */}
      <div
        style={{
          fontSize: '2.5rem',
          color: 'var(--color-border-primary)',
        }}
      >
        {icon}
      </div>

      {/* Title */}
      <h3
        style={{
          fontSize: 'var(--font-size-lg)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--color-text-primary)',
          textAlign: 'center',
          margin: 0,
        }}
      >
        {title}
      </h3>

      {/* Description */}
      <p
        style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-secondary)',
          textAlign: 'center',
          margin: 0,
          maxWidth: '260px',
        }}
      >
        {description}
      </p>

      {/* CTA Button (optional) */}
      {action && (
        <button
          onClick={action.onClick}
          style={{
            marginTop: 'var(--space-md)',
            padding: `var(--space-sm) var(--space-md)`,
            backgroundColor: 'var(--color-brand-bronze)',
            color: 'var(--color-surface-white)',
            border: 'none',
            borderRadius: 'var(--radius-button)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-semibold)',
            cursor: 'pointer',
            transition: 'background-color 200ms ease',
          }}
          data-testid={`${testId}-action-button`}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyStateCard;
