import { useState } from 'react';
import { useShipperAnalytics } from '../hooks/useLoadBoardAnalytics';
import { useAuthStore } from '@/stores/authStore';
import { MetricCard } from '@/components/ui/MetricCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';

export const ShipperPerformanceDashboard = () => {
  const [range, setRange] = useState<7 | 30 | 90>(7);
  const user = useAuthStore((state) => state.user);
  const { data, isLoading, error } = useShipperAnalytics(
    user?.id || '',
    range
  );

  if (!user?.id) {
    return <ErrorAlert message="User not authenticated" />;
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorAlert message="Failed to load performance metrics" />;
  }

  if (!data) {
    return <ErrorAlert message="No performance data available" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Performance</h1>
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
          title="Loads Posted"
          value={data.postedCount.toLocaleString()}
          icon="📋"
        />
        <MetricCard
          title="Loads Claimed"
          value={data.claimedCount.toLocaleString()}
          subtext={`${data.claimPercentage}% claim rate`}
          icon="✓"
        />
        <MetricCard
          title="Claim Rate"
          value={`${data.claimPercentage}%`}
          icon="📊"
        />
        <MetricCard
          title="Avg Claim Time"
          value={`${data.avgClaimTimeHours.toFixed(1)}h`}
          icon="⏱️"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Load Status</h2>
          <dl className="space-y-4">
            <div className="flex justify-between">
              <dt className="text-gray-600">Posted</dt>
              <dd className="font-medium text-lg">{data.postedCount}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Claimed</dt>
              <dd className="font-medium text-lg text-green-600">
                {data.claimedCount}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Unclaimed</dt>
              <dd className="font-medium text-lg text-yellow-600">
                {data.postedCount - data.claimedCount}
              </dd>
            </div>
            <div className="border-t pt-4 flex justify-between">
              <dt className="text-gray-600">Claim Rate</dt>
              <dd className="font-semibold text-blue-600">
                {data.claimPercentage}%
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Performance Insights</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Claim Performance</span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    data.claimPercentage > 70
                      ? 'bg-green-500'
                      : data.claimPercentage > 50
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                  }`}
                  style={{
                    width: `${Math.min(data.claimPercentage, 100)}%`,
                  }}
                />
              </div>
            </div>
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                {data.claimPercentage > 70
                  ? '✅ Strong claim rate - competitive pricing'
                  : data.claimPercentage > 50
                    ? '⚠️ Moderate claim rate'
                    : '❌ Low claim rate - consider reducing rates'}
              </p>
              <p>
                Average claim time: {data.avgClaimTimeHours.toFixed(2)} hours
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
