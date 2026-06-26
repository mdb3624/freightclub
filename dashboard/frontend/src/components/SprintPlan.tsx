import React from 'react';

interface SprintPlanProps {
  sprint: any;
}

export const SprintPlan: React.FC<SprintPlanProps> = ({ sprint }) => {
  if (!sprint || !sprint.stories || sprint.stories.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Sprint Plan</h2>
        <p className="text-gray-600">No active sprint</p>
      </div>
    );
  }

  const completedCount = sprint.completedCount || 0;
  const totalCount = sprint.totalCount || 0;
  const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Sprint Plan</h2>

      {/* Sprint Statistics */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Sprint Progress</span>
          <span className="text-sm font-semibold text-blue-600">{completionPercent}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">{completedCount} of {totalCount} stories complete</p>
      </div>

      {/* Sprint Stories List */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700 mb-3">{sprint.stories.length} stories in sprint:</p>
        <div className="space-y-1">
          {sprint.stories.slice(0, 5).map((story: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <span className="text-gray-700">{story.id}</span>
              <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                {story.status}
              </span>
            </div>
          ))}
          {sprint.stories.length > 5 && (
            <p className="text-xs text-gray-500 mt-2">
              +{sprint.stories.length - 5} more stories
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
