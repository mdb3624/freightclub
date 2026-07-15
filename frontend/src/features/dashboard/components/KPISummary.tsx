import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * US-820: KPI Summary Display
 *
 * Displays shipper business health metrics:
 * - Active Shipments count
 * - On-Time Delivery %
 * - Cost Per Mile
 *
 * Design Reference: docs/hfd/US-820_KPI_Summary_Design_Spec.md
 */

interface KPISummaryProps {
  activeLoadCount: number | null;
  onTimePercentage: number | null;
  costPerMile: number | null;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * KPICard Component - Reusable card for individual metrics
 *
 * Implements the "Number-First" hierarchy pattern:
 * - Large numeric badge (font-black text-6xl)
 * - Small label (text-xs UPPERCASE tracking-widest)
 */
interface KPICardProps {
  number: number | string | null;
  label: string;
  suffix?: string;
  prefix?: string;
  statusColor?: 'green' | 'yellow' | 'red' | 'default';
  isLoading?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({
  number,
  label,
  suffix = '',
  prefix = '',
  statusColor = 'default',
  isLoading = false,
}) => {
  // Color mapping for status badges (On-Time % only)
  const getStatusColor = () => {
    switch (statusColor) {
      case 'green':
        return 'text-green-600'; // #4CAF50
      case 'yellow':
        return 'text-yellow-500'; // #FFC107
      case 'red':
        return 'text-red-500'; // #F44336
      default:
        return 'text-gray-900'; // #1A1A1A (dark text)
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* KPI Number - Highest visual hierarchy */}
      <div className="mb-2">
        {isLoading ? (
          <div className="h-16 bg-gray-200 rounded animate-pulse" />
        ) : number !== null ? (
          <div className={`text-6xl font-black leading-tight ${getStatusColor()}`}>
            {prefix}
            {number}
            {suffix}
          </div>
        ) : (
          <div className="text-4xl text-gray-400">—</div>
        )}
      </div>

      {/* KPI Label - Secondary visual hierarchy */}
      <div className="text-xs font-normal uppercase tracking-widest text-gray-600">
        {label}
      </div>
    </div>
  );
};

/**
 * EmptyState Component - Shown when shipper has no active loads
 *
 * Displays:
 * - Rocket icon (visual indicator)
 * - Friendly message + CTA button
 * - Secondary action (optional)
 */
const EmptyState: React.FC<{ onCreateClick: () => void }> = ({ onCreateClick }) => {
  return (
    <div className="bg-amber-50 border border-gray-300 rounded-lg p-12 text-center">
      {/* Rocket Icon */}
      <div className="mb-6 text-6xl" role="img" aria-label="Rocket">
        🚀
      </div>

      {/* Heading */}
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        No active shipments yet.
      </h2>

      {/* Subheading */}
      <p className="text-base text-gray-600 mb-8">
        Let's get your first load on the board in 2 minutes.
      </p>

      {/* Primary CTA Button - Bronze gradient */}
      <button
        onClick={onCreateClick}
        style={{
          background:
            'linear-gradient(180deg, #C9A46A 0%, #B08D57 45%, #8C6D3F 100%)',
          boxShadow:
            'inset 0 1px 2px rgba(255,255,255,0.25), inset 0 -1px 2px rgba(0,0,0,0.2), 0 2px 5px rgba(0,0,0,0.35)',
          border: '1px solid #7A5F3A',
        }}
        className="w-full py-3 px-6 rounded-lg text-white font-semibold mb-4 transition-all duration-150 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-offset-2"
        aria-label="Create your first load"
      >
        Create Your First Load
      </button>

      {/* Secondary Action */}
      <a
        href="#"
        className="text-amber-700 hover:underline text-sm font-medium inline-block"
      >
        or view example loads →
      </a>
    </div>
  );
};

/**
 * Main KPISummary Component
 *
 * Responsive layout:
 * - Desktop (≥1024px): 3 cards in single row
 * - Tablet (768px–1023px): 2 + 1 card layout
 * - Mobile (≤767px): 1 card per row
 */
export const KPISummary: React.FC<KPISummaryProps> = ({
  activeLoadCount,
  onTimePercentage,
  costPerMile,
  isLoading = false,
  error = null,
}) => {
  const navigate = useNavigate();

  // Determine on-time % status color
  const getOnTimeStatusColor = (): 'green' | 'yellow' | 'red' | 'default' => {
    if (onTimePercentage === null) return 'default';
    if (onTimePercentage >= 90) return 'green';
    if (onTimePercentage >= 75) return 'yellow';
    return 'red';
  };

  // Check if empty state should be shown
  const showEmptyState = !isLoading && activeLoadCount === 0;

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
        <p className="font-semibold">Unable to load dashboard</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Section Label */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Business Health</h1>
        <p className="text-gray-600 mt-1">Real-time overview of your shipments</p>
      </div>

      {/* KPI Cards Grid - Responsive layout */}
      {showEmptyState ? (
        <EmptyState onCreateClick={() => navigate('/shipper/loads/new')} />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: Active Shipments */}
          <KPICard
            number={activeLoadCount}
            label="Active Loads"
            isLoading={isLoading}
            statusColor="default"
          />

          {/* Card 2: On-Time Delivery % */}
          <KPICard
            number={
              onTimePercentage !== null
                ? onTimePercentage.toFixed(1)
                : null
            }
            suffix="%"
            label="On-Time Delivery"
            isLoading={isLoading}
            statusColor={getOnTimeStatusColor()}
          />

          {/* Card 3: Cost Per Mile */}
          <KPICard
            number={
              costPerMile !== null ? costPerMile.toFixed(2) : null
            }
            prefix="$"
            label="Cost Per Mile"
            isLoading={isLoading}
            statusColor="default"
          />
        </div>
      )}

      {/* Data Freshness Indicator (Optional) */}
      {!isLoading && !showEmptyState && (
        <div className="text-xs text-gray-500 text-right">
          Updated just now · Last refresh: {new Date().toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default KPISummary;
