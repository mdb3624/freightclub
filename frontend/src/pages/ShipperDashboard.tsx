import { useNavigate } from 'react-router-dom'
import { useShipperProfile } from '@/features/shipper'

export function ShipperDashboard() {
  const navigate = useNavigate()
  const { data: profile, isLoading: profileLoading } = useShipperProfile()

  if (profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shipper Dashboard</h1>
          <p className="mt-2 text-gray-600">
            {profile?.companyName ? `Welcome, ${profile.companyName}` : 'Manage your loads and company profile'}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Card */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Profile</h2>
            {profile ? (
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-semibold">Company:</span> {profile.companyName}</p>
                <p><span className="font-semibold">Email:</span> {profile.billingEmail}</p>
                {profile.mcNumber && <p><span className="font-semibold">MC#:</span> {profile.mcNumber}</p>}
              </div>
            ) : (
              <p className="text-sm text-gray-600 mb-4">Set up your company profile to get started</p>
            )}
            <button
              onClick={() => navigate('/profile')}
              className="mt-4 w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
            >
              {profile ? 'Edit Profile' : 'Set Up Profile'}
            </button>
          </div>

          {/* Loads Card */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Manage Loads</h2>
            <p className="text-sm text-gray-600 mb-4">Create and track your freight loads</p>
            <button
              onClick={() => navigate('/shipper/loads/new')}
              className="w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
            >
              Post New Load
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
