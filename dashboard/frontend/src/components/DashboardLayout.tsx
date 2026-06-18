import React from 'react';
import { ActiveStory } from './ActiveStory';
import { SprintPlan } from './SprintPlan';
import { Backlog } from './Backlog';

interface DashboardLayoutProps {
  data: any;
  loading: boolean;
  error: Error | null;
  lastUpdated: string;
  onRefresh: () => Promise<void>;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  data,
  loading,
  error,
  lastUpdated,
  onRefresh,
}) => {
  // Loading state: show centered message
  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  // Error state: show error with retry button
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">Error: {error.message}</p>
          <button
            onClick={onRefresh}
            className="px-3 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <p className="text-lg text-gray-600">No data available</p>
      </div>
    );
  }

  // Main dashboard render
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header section */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Agile Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Updated: {new Date(lastUpdated).toLocaleTimeString()}
          </span>
          <button
            onClick={onRefresh}
            className="px-3 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* 3-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Column 1: Active Story */}
        <div>
          <ActiveStory story={data.activeStories?.[0]} />
        </div>

        {/* Column 2: Sprint Plan */}
        <div>
          <SprintPlan sprint={data.currentSprint} />
        </div>

        {/* Column 3: Backlog */}
        <div>
          <Backlog backlog={data.backlog} />
        </div>
      </div>
    </div>
  );
};
