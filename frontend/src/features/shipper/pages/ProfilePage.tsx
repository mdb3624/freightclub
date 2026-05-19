import { useNavigate } from 'react-router-dom'
import { useShipperProfile } from '../hooks/useShipperProfile'
import { ShipperProfileForm } from '../components/ShipperProfileForm'
import type { ShipperProfileResponse } from '@/types'

export function ProfilePage() {
  const navigate = useNavigate()
  const { data: profile, isLoading, error } = useShipperProfile()

  const handleSuccess = (_updatedProfile: ShipperProfileResponse) => {
    // Navigate back to dashboard after successful save
    navigate('/dashboard/shipper', { replace: true })
  }

  const handleCancel = () => {
    navigate(-1)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shipper Company Profile</h1>
          <p className="text-gray-600 mt-2">Set up your company information to start publishing loads</p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            <p className="text-gray-600 mt-4">Loading profile...</p>
          </div>
        )}

        {/* Error State */}
        {error && !(error instanceof Error && error.message.includes('404')) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 font-medium">Error loading profile</p>
            <p className="text-red-600 text-sm">
              {error instanceof Error ? error.message : 'An unexpected error occurred'}
            </p>
          </div>
        )}

        {/* Completeness Status Section */}
        {!isLoading && profile && (
          <div className="mb-8">
            <div className={`rounded-lg border-l-4 p-4 ${
              profile.profileCompleteness >= 80
                ? 'bg-green-50 border-l-green-500'
                : 'bg-yellow-50 border-l-yellow-500'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`font-semibold ${
                    profile.profileCompleteness >= 80 ? 'text-green-900' : 'text-yellow-900'
                  }`}>
                    Profile Status
                  </h2>
                  <p className={`text-sm mt-1 ${
                    profile.profileCompleteness >= 80 ? 'text-green-800' : 'text-yellow-800'
                  }`}>
                    {profile.profileCompleteness >= 80
                      ? '✓ Your profile is ready - you can publish loads'
                      : `⚠ Complete your profile to publish loads (${profile.profileCompleteness}% done)`}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${
                    profile.profileCompleteness >= 80 ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {profile.profileCompleteness}%
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Complete</p>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div
                  className={`h-2 rounded-full transition-all ${
                    profile.profileCompleteness >= 80 ? 'bg-green-500' : 'bg-yellow-500'
                  }`}
                  style={{ width: `${profile.profileCompleteness}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Profile Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {!isLoading && (
            <ShipperProfileForm
              initialData={profile}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Tip:</strong> Complete all required fields to unlock the ability to post loads on the board.
            Optional fields like MC and USDOT numbers help establish credibility.
          </p>
        </div>
      </div>
    </div>
  )
}
