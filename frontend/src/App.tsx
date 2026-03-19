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
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Toaster } from '@/components/ui/Toaster'

export default function App() {
  return (
    <>
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

      <Route path="/" element={<TruckerLandingPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}
