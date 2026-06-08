import { Component, type ReactNode, lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { TruckerLandingPage } from '@/pages/TruckerLandingPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AuthInitializer } from '@/components/AuthInitializer'
import { PersonaThemeProvider } from '@/contexts/PersonaThemeContext'
import { Toaster } from '@/components/ui/Toaster'

// Lazy load dashboard and protected routes to defer vendor-query and dashboard code
const TruckerDashboard = lazy(() => import('@/pages/TruckerDashboard').then(m => ({ default: m.TruckerDashboard })))
const ShipperDashboard = lazy(() => import('@/pages/ShipperDashboard').then(m => ({ default: m.ShipperDashboard })))
const LoadCreatePage = lazy(() => import('@/pages/LoadCreatePage').then(m => ({ default: m.LoadCreatePage })))
const LoadDetailPage = lazy(() => import('@/pages/LoadDetailPage').then(m => ({ default: m.LoadDetailPage })))
const LoadEditPage = lazy(() => import('@/pages/LoadEditPage').then(m => ({ default: m.LoadEditPage })))
const TruckerLoadDetailPage = lazy(() => import('@/pages/TruckerLoadDetailPage').then(m => ({ default: m.TruckerLoadDetailPage })))
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then(m => ({ default: m.ProfilePage })))
const RatingsPage = lazy(() => import('@/pages/RatingsPage').then(m => ({ default: m.RatingsPage })))
// const AnalyticsPage = lazy(() => import('@/features/analytics/pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })))
const PreferredCarriersList = lazy(() => import('@/features/shippers/components/PreferredCarriersList').then(m => ({ default: m.PreferredCarriersList })))
const CarrierPublicProfilePage = lazy(() => import('@/features/carriers/components/CarrierPublicProfilePage').then(m => ({ default: m.CarrierPublicProfilePage })))

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center p-8 text-center">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-sm text-gray-600 mb-4">An unexpected error occurred. Please refresh the page.</p>
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

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" />
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
    <AuthInitializer>
    <PersonaThemeProvider>
      <Toaster />
      <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* US-713: Shipper Company Profile Setup - deferred to backlog */}

      <Route
        path="/dashboard/trucker"
        element={
          <ProtectedRoute role="TRUCKER">
            <Suspense fallback={<PageLoader />}>
              <TruckerDashboard />
            </Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/shipper"
        element={
          <ProtectedRoute role="SHIPPER">
            <Suspense fallback={<PageLoader />}>
              <ShipperDashboard />
            </Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="/trucker/loads/:id"
        element={
          <ProtectedRoute role="TRUCKER">
            <Suspense fallback={<PageLoader />}>
              <TruckerLoadDetailPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="/shipper/loads/new"
        element={
          <ProtectedRoute role="SHIPPER">
            <Suspense fallback={<PageLoader />}>
              <LoadCreatePage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/shipper/loads/:id"
        element={
          <ProtectedRoute role="SHIPPER">
            <Suspense fallback={<PageLoader />}>
              <LoadDetailPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/shipper/loads/:id/edit"
        element={
          <ProtectedRoute role="SHIPPER">
            <Suspense fallback={<PageLoader />}>
              <LoadEditPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      
<Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <ProfilePage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="/ratings"
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <RatingsPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Analytics disabled pending refactor of broken imports */}
      {/* <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <AnalyticsPage />
            </Suspense>
          </ProtectedRoute>
        }
      /> */}

      {/* US-707: Shipper Preferred Carriers */}
      <Route
        path="/settings/preferred-carriers"
        element={
          <ProtectedRoute role="SHIPPER">
            <Suspense fallback={<PageLoader />}>
              <PreferredCarriersList />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* US-710: Carrier Public Profile */}
      <Route
        path="/carriers/:carrierId"
        element={
          <ProtectedRoute role="SHIPPER">
            <Suspense fallback={<PageLoader />}>
              <CarrierPublicProfilePage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="/shipper/profile"
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <ProfilePage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<TruckerLandingPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </PersonaThemeProvider>
    </AuthInitializer>
    </ErrorBoundary>
  )
}
