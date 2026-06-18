import React from 'react';

interface ActiveStoryProps {
  story?: any;
}

const roleLabels: Record<string, string> = {
  ba: 'BA',
  architect: 'ARCH',
  hfd: 'HFD',
  coder: 'CODER',
  reviewer: 'REVIEWER',
};

const roleOrder = ['ba', 'architect', 'hfd', 'coder', 'reviewer'];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return 'bg-green-100 text-green-800';
    case 'BLOCKED':
      return 'bg-red-100 text-red-800';
    case 'IN_PROGRESS':
      return 'bg-yellow-100 text-yellow-800';
    case 'PENDING':
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const ActiveStory: React.FC<ActiveStoryProps> = ({ story }) => {
  if (!story) {
    return (
      <div className="rounded-lg bg-gray-50 p-6 text-center text-gray-500">
        No active stories
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-amber-300 bg-white shadow">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="mb-2 text-xs font-semibold text-gray-500 uppercase">
          {story.id}
        </div>
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{story.title}</h2>
          <span className="inline-block rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
            {story.status || 'PENDING'}
          </span>
        </div>
      </div>

      {/* Workflow Timeline */}
      <div className="border-t border-gray-200 p-6">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-700">
          Workflow
        </h3>
        <div className="space-y-3">
          {roleOrder.map((role) => {
            const status = story.roles?.[role] || 'PENDING';
            return (
              <div key={role} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {roleLabels[role]}
                </span>
                <span
                  className={`inline-block rounded px-2 py-1 text-xs font-semibold ${getStatusColor(
                    status
                  )}`}
                >
                  {status}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dependencies */}
      {story.dependencies && story.dependencies.length > 0 && (
        <div className="border-t border-gray-200 p-6">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-700">
            Dependencies
          </h3>
          <ul className="space-y-1 text-sm text-gray-700">
            {story.dependencies.map((dep: string, idx: number) => (
              <li key={idx}>• {dep}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Coverage */}
      {story.coverage !== undefined && (
        <div className="border-t border-gray-200 p-6">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-700">
            Coverage
          </h3>
          <div className="text-2xl font-bold text-amber-700">{story.coverage}%</div>
        </div>
      )}
    </div>
  );
};

export default ActiveStory;
