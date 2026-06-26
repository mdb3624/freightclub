import React, { useState } from 'react';

interface BacklogProps {
  backlog: any[];
}

export const Backlog: React.FC<BacklogProps> = ({ backlog }) => {
  const [viewMode, setViewMode] = useState<'status' | 'phase'>('status');

  if (!backlog || backlog.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Backlog</h2>
        <p className="text-gray-600">No items in backlog</p>
      </div>
    );
  }

  // Group by phase
  const groupedByPhase: Record<string, any[]> = {};
  backlog.forEach((item: any) => {
    const phase = String(item.phase);
    if (!groupedByPhase[phase]) {
      groupedByPhase[phase] = [];
    }
    groupedByPhase[phase].push(item);
  });

  // Sort phases
  const sortedPhases = Object.keys(groupedByPhase).sort((a, b) => {
    if (a === 'cross') return 1;
    if (b === 'cross') return -1;
    return Number(a) - Number(b);
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-700';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-700';
      case 'BACKLOG':
        return 'bg-gray-100 text-gray-700';
      case 'MIGRATION_PENDING':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPhaseLabel = (phase: string) => {
    if (phase === 'cross') return 'Cross-Phase';
    return `Phase ${phase}`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Backlog</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('status')}
            className={`text-xs px-2 py-1 rounded ${
              viewMode === 'status'
                ? 'bg-yellow-200 text-yellow-900 font-semibold'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Status
          </button>
          <button
            onClick={() => setViewMode('phase')}
            className={`text-xs px-2 py-1 rounded ${
              viewMode === 'phase'
                ? 'bg-yellow-200 text-yellow-900 font-semibold'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Phase
          </button>
        </div>
      </div>

      {viewMode === 'phase' ? (
        // Phase View
        <div className="space-y-3">
          {sortedPhases.map((phase) => (
            <div key={phase} className="border-b border-gray-200 pb-2 last:border-0">
              <h3 className="text-xs font-semibold text-gray-700 uppercase mb-1">
                {getPhaseLabel(phase)} ({groupedByPhase[phase].length})
              </h3>
              <div className="space-y-1">
                {groupedByPhase[phase].slice(0, 2).map((item: any, idx: number) => (
                  <div key={`${phase}-${idx}`} className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-900">{item.id}</span>
                    <span className={`px-1 py-0.5 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
                {groupedByPhase[phase].length > 2 && (
                  <p className="text-xs text-gray-500">+{groupedByPhase[phase].length - 2} more</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Status View
        <div className="space-y-3">
          {(() => {
            const completed = backlog.filter((item: any) => item.status === 'COMPLETED');
            const incomplete = backlog.filter((item: any) => item.status !== 'COMPLETED');

            return (
              <>
                {completed.length > 0 && (
                  <div className="border-b border-gray-200 pb-2">
                    <h3 className="text-xs font-semibold text-green-700 uppercase mb-1">✓ Completed ({completed.length})</h3>
                    <div className="space-y-1">
                      {completed.slice(0, 2).map((item: any, idx: number) => (
                        <div key={`completed-${idx}`} className="text-xs text-gray-900">{item.id}</div>
                      ))}
                      {completed.length > 2 && (
                        <p className="text-xs text-green-600 font-medium">+{completed.length - 2} completed</p>
                      )}
                    </div>
                  </div>
                )}
                {incomplete.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-700 uppercase mb-1">Pending ({incomplete.length})</h3>
                    <div className="space-y-1">
                      {incomplete.slice(0, 2).map((item: any, idx: number) => (
                        <div key={`pending-${idx}`} className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-900">{item.id}</span>
                          <span className={`px-1 py-0.5 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </div>
                      ))}
                      {incomplete.length > 2 && (
                        <p className="text-xs text-gray-500">+{incomplete.length - 2} pending</p>
                      )}
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};
