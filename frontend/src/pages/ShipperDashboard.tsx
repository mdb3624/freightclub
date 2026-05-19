import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export function ShipperDashboard() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shipper Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome, {user?.firstName}! Manage your loads and company profile.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Card */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Profile</h2>
            <p className="text-sm text-gray-600 mb-4">Set up and manage your company information</p>
            <button
              onClick={() => navigate('/profile')}
              className="w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
            >
              Go to Profile
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
