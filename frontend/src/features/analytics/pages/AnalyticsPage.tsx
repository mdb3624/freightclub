import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { AdminLoadBoardDashboard } from '../components/AdminLoadBoardDashboard';
import { ShipperPerformanceDashboard } from '../components/ShipperPerformanceDashboard';
import { RevenueDashboard } from '../components/RevenueDashboard';

type AnalyticsView = 'admin' | 'performance' | 'revenue';

export const AnalyticsPage = () => {
  const [activeView, setActiveView] = useState<AnalyticsView>('performance');
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <div className="p-6 text-center text-gray-600">Please log in to view analytics.</div>;
  }

  const isAdmin = user.role === 'ADMIN' || user.role === 'OWNER_OPERATOR';

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            {isAdmin && (
              <button
                onClick={() => setActiveView('admin')}
                className={`flex-1 py-4 px-6 text-center font-medium ${
                  activeView === 'admin'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Load Board Analytics
              </button>
            )}
            {user.role === 'SHIPPER' && (
              <>
                <button
                  onClick={() => setActiveView('performance')}
                  className={`flex-1 py-4 px-6 text-center font-medium ${
                    activeView === 'performance'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  My Performance
                </button>
                <button
                  onClick={() => setActiveView('revenue')}
                  className={`flex-1 py-4 px-6 text-center font-medium ${
                    activeView === 'revenue'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Revenue
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div>
          {activeView === 'admin' && <AdminLoadBoardDashboard />}
          {activeView === 'performance' && <ShipperPerformanceDashboard />}
          {activeView === 'revenue' && <RevenueDashboard />}
        </div>
      </div>
    </div>
  );
};
