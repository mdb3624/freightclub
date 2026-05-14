import { useNavigate } from 'react-router-dom';
import { useProfileCompleteness } from '@/features/shipper/hooks/useShipperProfile';
import { ShipperProfileForm } from '@/features/shipper/components/ShipperProfileForm';
import { AppShell } from '@/components/AppShell';
import { Button } from '@/components/ui/Button';

export function ShipperProfilePage() {
  const navigate = useNavigate();
  const { data: completeness } = useProfileCompleteness();

  return (
    <AppShell maxWidth="xl">
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-1"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Company Profile</h1>
        <p className="text-gray-600">
          Complete your company profile to unlock load publishing. You're {completeness?.completenessPercent ?? 0}% done.
        </p>
      </div>

      {completeness && completeness.completenessPercent >= 80 && (
        <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4">
          <p className="text-sm font-medium text-green-800">
            ✓ Your profile is complete! You can publish loads now.
          </p>
        </div>
      )}

      {completeness && completeness.completenessPercent < 80 && (
        <div className="mb-6 rounded-lg bg-amber-50 border border-amber-200 p-4">
          <p className="text-sm font-medium text-amber-900 mb-2">
            Complete the following fields to reach 80%:
          </p>
          <ul className="text-sm text-amber-800 list-disc list-inside space-y-1">
            {completeness.remainingFields.map((field) => (
              <li key={field}>{field}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Progress bar */}
      {completeness && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Profile Completeness</span>
            <span className="text-sm font-bold text-gray-900">{completeness.completenessPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                completeness.completenessPercent >= 80 ? 'bg-green-500' : 'bg-amber-500'
              }`}
              style={{ width: `${completeness.completenessPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <ShipperProfileForm />
      </div>

      {/* Secondary action */}
      <div className="mt-8 flex justify-center">
        <Button variant="secondary" onClick={() => navigate('/shipper/dashboard')}>
          Return to Dashboard
        </Button>
      </div>
    </AppShell>
  );
}
