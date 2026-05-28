import { useCarrierPerformance, useCarrierBenchmarks } from '../hooks/useCarrierPerformance';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { StarRating } from '@/components/ui/StarRating';

interface CarrierPerformanceCardProps {
  carrierId: string;
  carrierName: string;
}

export const CarrierPerformanceCard = ({
  carrierId,
  carrierName,
}: CarrierPerformanceCardProps) => {
  const { data: performance, isLoading, error } = useCarrierPerformance(carrierId);
  const { data: benchmarks } = useCarrierBenchmarks();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorAlert message="Failed to load carrier performance" />;
  }

  if (!performance) {
    return <ErrorAlert message="No performance data available" />;
  }

  const acceptanceAboveBenchmark =
    benchmarks &&
    performance.acceptanceRate > benchmarks.avgAcceptanceRate;
  const onTimeAboveBenchmark =
    benchmarks && performance.onTimeRate > benchmarks.avgOnTimeRate;
  const qualityAboveBenchmark =
    benchmarks && performance.qualityScore > benchmarks.avgQualityScore;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{carrierName}</h2>
        <div className="flex items-center gap-2 mt-2">
          <StarRating rating={performance.qualityScore} size="lg" />
          <span className="text-sm text-gray-600">
            {performance.qualityScore.toFixed(1)}/5 ({performance.ratingCount} ratings)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded p-4">
          <div className="flex justify-between items-start mb-2">
            <span className="text-gray-700 font-medium">Acceptance Rate</span>
            {acceptanceAboveBenchmark && (
              <span className="text-green-600 text-sm font-semibold">✅ Above Avg</span>
            )}
          </div>
          <div className="text-3xl font-bold text-blue-600">
            {performance.acceptanceRate.toFixed(0)}%
          </div>
          {benchmarks && (
            <div className="text-sm text-gray-600 mt-2">
              Platform avg: {benchmarks.avgAcceptanceRate.toFixed(0)}%
            </div>
          )}
        </div>

        <div className="bg-green-50 rounded p-4">
          <div className="flex justify-between items-start mb-2">
            <span className="text-gray-700 font-medium">On-Time Delivery</span>
            {onTimeAboveBenchmark && (
              <span className="text-green-600 text-sm font-semibold">✅ Above Avg</span>
            )}
          </div>
          <div className="text-3xl font-bold text-green-600">
            {performance.onTimeRate.toFixed(0)}%
          </div>
          {benchmarks && (
            <div className="text-sm text-gray-600 mt-2">
              Platform avg: {benchmarks.avgOnTimeRate.toFixed(0)}%
            </div>
          )}
        </div>

        <div className="bg-purple-50 rounded p-4">
          <span className="text-gray-700 font-medium">Avg Delivery Time</span>
          <div className="text-3xl font-bold text-purple-600 mt-1">
            {performance.avgDeliveryTimeHours.toFixed(1)}h
          </div>
          <div className="text-sm text-gray-600 mt-2">
            {performance.loadsCompleted} loads completed
          </div>
        </div>

        <div className="bg-yellow-50 rounded p-4">
          <span className="text-gray-700 font-medium">Quality Rating</span>
          <div className="text-3xl font-bold text-yellow-600 mt-1">
            {performance.qualityScore.toFixed(1)}
          </div>
          {qualityAboveBenchmark && (
            <div className="text-sm text-green-600 font-semibold mt-2">
              ✅ Above platform avg
            </div>
          )}
        </div>
      </div>

      <div className="border-t pt-4">
        <p className="text-sm text-gray-600">
          Preferred by <span className="font-semibold">{performance.preferredByCount}</span> shippers
        </p>
      </div>

      <div className="bg-gray-50 rounded p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Reliability Assessment</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Acceptance</span>
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${Math.min(performance.acceptanceRate, 100)}%` }}
              />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">On-Time</span>
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${Math.min(performance.onTimeRate, 100)}%` }}
              />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Quality</span>
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-500 h-2 rounded-full"
                style={{ width: `${(performance.qualityScore / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
