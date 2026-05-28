import { useState } from 'react';
import { useAdminAnalytics } from '../hooks/useLoadBoardAnalytics';
import { MetricCard } from '@/components/ui/MetricCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';

export const AdminLoadBoardDashboard = () => {
  const [range, setRange] = useState<7 | 30 | 90>(7);
  const { data, isLoading, error } = useAdminAnalytics(range);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorAlert message="Failed to load analytics" />;
  }

  if (!data) {
    return <ErrorAlert message="No analytics data available" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Load Board Analytics</h1>
        <div className="flex gap-2">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setRange(d as 7 | 30 | 90)}
              className={`px-4 py-2 rounded ${
                range === d
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Last {d} Days
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Posted"
          value={data.totalPosted.toLocaleString()}
          icon="📦"
        />
        <MetricCard
          title="Total Claimed"
          value={data.totalClaimed.toLocaleString()}
          subtext={`${data.claimPercentage}% claim rate`}
          icon="✅"
        />
        <MetricCard
          title="Avg Time to Claim"
          value={`${data.avgClaimTimeHours.toFixed(1)}h`}
          icon="⏱️"
        />
        <MetricCard
          title="Claim Rate"
          value={`${data.claimPercentage}%`}
          icon="📊"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Summary Statistics</h2>
          <dl className="space-y-4">
            <div className="flex justify-between">
              <dt className="text-gray-600">Unclaimed Loads</dt>
              <dd className="font-medium">
                {data.totalPosted - data.totalClaimed}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Claim Percentage</dt>
              <dd className="font-medium">{data.claimPercentage}%</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Time to Claim</dt>
              <dd className="font-medium">
                {data.avgClaimTimeHours.toFixed(2)} hours
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Key Metrics</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Market Health</span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${Math.min(data.claimPercentage, 100)}%`,
                  }}
                />
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {data.claimPercentage > 80
                ? '✅ Healthy market - strong demand'
                : data.claimPercentage > 50
                  ? '⚠️ Moderate demand'
                  : '❌ Low demand - pricing adjustment needed'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
