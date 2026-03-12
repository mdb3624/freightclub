import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ShipperDashboard } from '@/pages/ShipperDashboard'
import { TruckerDashboard } from '@/pages/TruckerDashboard'
import { LoadsListPage } from '@/pages/LoadsListPage'
import { LoadCreatePage } from '@/pages/LoadCreatePage'
import { LoadDetailPage } from '@/pages/LoadDetailPage'
import { LoadEditPage } from '@/pages/LoadEditPage'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function App() {
  return (
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
        path="/shipper/loads"
        element={
          <ProtectedRoute role="SHIPPER">
            <LoadsListPage />
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

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
