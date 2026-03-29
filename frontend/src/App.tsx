import { Component, type ReactNode } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { TruckerLandingPage } from '@/pages/TruckerLandingPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ShipperDashboard } from '@/pages/ShipperDashboard'
import { TruckerDashboard } from '@/pages/TruckerDashboard'
import { LoadCreatePage } from '@/pages/LoadCreatePage'
import { LoadDetailPage } from '@/pages/LoadDetailPage'
import { LoadEditPage } from '@/pages/LoadEditPage'
import { TruckerLoadDetailPage } from '@/pages/TruckerLoadDetailPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { RatingsPage } from '@/pages/RatingsPage'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AuthInitializer } from '@/components/AuthInitializer'
import { Toaster } from '@/components/ui/Toaster'

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center p-8 text-center">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-sm text-gray-500 mb-4">An unexpected error occurred. Please refresh the page.</p>
            <button
              className="text-sm text-primary-600 underline"
              onClick={() => window.location.reload()}
            >
              Refresh
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  return (
    <ErrorBoundary>
    <AuthInitializer>
      <Toaster />
      <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/dashboard/shipper"
        element={
          <ProtectedRoute role="SHIPPER">
            <ShipperDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/trucker"
        element={
          <ProtectedRoute role="TRUCKER">
            <TruckerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/trucker/loads/:id"
        element={
          <ProtectedRoute role="TRUCKER">
            <TruckerLoadDetailPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/shipper/loads/new"
        element={
          <ProtectedRoute role="SHIPPER">
            <LoadCreatePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/shipper/loads/:id"
        element={
          <ProtectedRoute role="SHIPPER">
            <LoadDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/shipper/loads/:id/edit"
        element={
          <ProtectedRoute role="SHIPPER">
            <LoadEditPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ratings"
        element={
          <ProtectedRoute>
            <RatingsPage />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<TruckerLandingPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </AuthInitializer>
    </ErrorBoundary>
  )
}
