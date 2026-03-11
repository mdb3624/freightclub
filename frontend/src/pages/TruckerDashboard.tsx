import { useAuthStore } from '@/store/authStore'
import { useLogout } from '@/features/auth/hooks/useLogout'
import { Button } from '@/components/ui/Button'

export function TruckerDashboard() {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">FreightClub</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {user?.firstName} {user?.lastName}
          </span>
          <Button variant="secondary" onClick={logout}>
            Sign out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">Trucker Dashboard</h2>
          <p className="mt-1 text-gray-600">
            Welcome back, {user?.firstName}. Browse and claim loads here.
          </p>
        </div>

        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-400">
          Load board coming soon
        </div>
      </main>
    </div>
  )
}
