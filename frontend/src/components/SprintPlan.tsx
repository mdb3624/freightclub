import React from 'react';

interface SprintPlanProps {
  sprint?: any;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'text-green-700 bg-green-50';
    case 'IN_PROGRESS':
      return 'text-yellow-700 bg-yellow-50';
    case 'READY_FOR_DESIGN':
      return 'text-blue-700 bg-blue-50';
    case 'BLOCKED':
      return 'text-red-700 bg-red-50';
    default:
      return 'text-gray-700 bg-gray-50';
  }
};

export const SprintPlan: React.FC<SprintPlanProps> = ({ sprint }) => {
  if (!sprint) {
    return (
      <div className="bg-white rounded-lg shadow border border-bronze-300 p-6">
        <p className="text-gray-500">No sprint data</p>
      </div>
    );
  }

  const stories = sprint.stories || [];
  const completedCount = stories.filter((story: any) => story.status === 'COMPLETED').length;
  const totalCount = stories.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-white rounded-lg shadow border border-bronze-300">
      {/* Header Section */}
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Sprint {sprint.number}</h2>
          <p className="text-sm text-gray-600 mt-1">
            {completedCount} / {totalCount} completed
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-bronze-700">{completionPercentage}%</p>
        </div>
      </div>

      {/* Progress Bar Section */}
      <div className="px-6 py-3">
        <div className="bg-gray-200 rounded-full h-2">
          <div
            className="bg-bronze-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Stories Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-t border-gray-200">
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Story</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {stories.map((story: any, index: number) => (
              <tr key={index} className="border-t border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-3">
                  <div className="font-medium text-gray-900">{story.id}</div>
                  <div className="text-xs text-gray-600">{story.title}</div>
                </td>
                <td className="px-6 py-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(story.status)}`}>
                    {story.status.replace(/_/g, ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SprintPlan;
