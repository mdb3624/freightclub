import { useState } from 'react';
import { useRevenueSummary } from '../hooks/useRevenueAnalytics';
import { useAuthStore } from '@/stores/authStore';
import { MetricCard } from '@/components/ui/MetricCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';

export const RevenueDashboard = () => {
  const [days, setDays] = useState<30 | 90 | 365>(30);
  const user = useAuthStore((state) => state.user);
  const { data, isLoading, error } = useRevenueSummary(user?.id || '', days);

  if (!user?.id) {
    return <ErrorAlert message="User not authenticated" />;
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorAlert message="Failed to load revenue data" />;
  }

  if (!data) {
    return <ErrorAlert message="No revenue data available" />;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Revenue Dashboard</h1>
        <div className="flex gap-2">
          {[30, 90, 365].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d as 30 | 90 | 365)}
              className={`px-4 py-2 rounded ${
                days === d
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Last {d === 365 ? '1Y' : `${d}D`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(data.totalRevenue)}
          icon="💰"
        />
        <MetricCard
          title="Total Commission"
          value={formatCurrency(data.totalCommission)}
          subtext="2% of revenue"
          icon="📌"
        />
        <MetricCard
          title="Net Revenue"
          value={formatCurrency(data.netRevenue)}
          icon="✓"
        />
        <MetricCard
          title="Loads"
          value={data.loadCount.toLocaleString()}
          subtext={`${formatCurrency(data.avgRevenuePerLoad)}/load`}
          icon="📦"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Revenue Breakdown</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-gray-700">Total Revenue</span>
              <span className="font-semibold text-lg">
                {formatCurrency(data.totalRevenue)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded">
              <span className="text-gray-700">Commission (2%)</span>
              <span className="font-semibold text-red-600">
                -{formatCurrency(data.totalCommission)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded border-t-2">
              <span className="text-gray-700 font-semibold">Net Revenue</span>
              <span className="font-bold text-green-600 text-lg">
                {formatCurrency(data.netRevenue)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Performance Metrics</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-700">Loads Posted</span>
                <span className="font-semibold">{data.loadCount}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-700">Revenue per Load</span>
                <span className="font-semibold">
                  {formatCurrency(data.avgRevenuePerLoad)}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Total: {formatCurrency(data.totalRevenue)} ÷ {data.loadCount} loads
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-700">Commission per Load</span>
                <span className="font-semibold">
                  {formatCurrency(data.totalCommission / data.loadCount)}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Approximately 2% of each load's revenue
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Summary</h2>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-gray-600 text-sm">Total Gross Revenue</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(data.totalRevenue)}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Your Net Revenue</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(data.netRevenue)}
            </p>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>
            You've earned <strong>{formatCurrency(data.netRevenue)}</strong> net revenue from{' '}
            <strong>{data.loadCount}</strong> loads at an average of{' '}
            <strong>{formatCurrency(data.avgRevenuePerLoad)}</strong> per load.
          </p>
        </div>
      </div>
    </div>
  );
};
