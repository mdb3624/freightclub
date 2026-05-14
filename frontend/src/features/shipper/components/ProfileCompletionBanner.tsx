import { Link } from 'react-router-dom';
import { useProfileCompleteness } from '../hooks/useShipperProfile';
import { Button } from '@/components/ui/Button';

export function ProfileCompletionBanner() {
  const { data: completeness, isLoading } = useProfileCompleteness();

  if (isLoading || !completeness) return null;

  // Only show banner if profile is incomplete
  if (completeness.completenessPercent >= 80) return null;

  const remainingCount = completeness.remainingFields.length;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="mb-6 rounded-lg border-l-4 border-amber-500 bg-amber-50 p-4"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-amber-900">
            Finish your setup to start publishing loads
          </h3>
          <p className="mt-1 text-sm text-amber-800">
            {completeness.completenessPercent}% complete • {remainingCount} field{remainingCount !== 1 ? 's' : ''} remaining
          </p>
          {remainingCount > 0 && (
            <div className="mt-2">
              <p className="text-xs font-medium text-amber-700 mb-1">Missing:</p>
              <ul className="text-xs text-amber-700 list-disc list-inside">
                {completeness.remainingFields.slice(0, 3).map((field) => (
                  <li key={field}>{field}</li>
                ))}
                {remainingCount > 3 && <li>and {remainingCount - 3} more...</li>}
              </ul>
            </div>
          )}
        </div>

        <Link to="/shipper/profile">
          <Button variant="secondary" size="md" className="ml-4 whitespace-nowrap">
            Complete Profile
          </Button>
        </Link>
      </div>

      {/* Progress indicator */}
      <div className="mt-4 w-full bg-amber-200 rounded-full h-2">
        <div
          className="bg-amber-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${completeness.completenessPercent}%` }}
          role="progressbar"
          aria-valuenow={completeness.completenessPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Profile ${completeness.completenessPercent}% complete`}
        />
      </div>
    </div>
  );
}
