import React, { useState } from 'react';

interface BacklogProps {
  backlog?: Record<string, any[]>;
}

export const Backlog: React.FC<BacklogProps> = ({ backlog }) => {
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);

  // Check if backlog is empty
  if (!backlog || Object.keys(backlog).length === 0) {
    return (
      <div className="bg-white rounded-lg shadow border border-bronze-300 p-6">
        <p className="text-gray-500">No backlog items</p>
      </div>
    );
  }

  // Calculate total stories
  const totalStories = Object.values(backlog).reduce((sum, stories) => sum + stories.length, 0);

  // Sort phases numerically
  const sortedPhases = Object.keys(backlog).sort((a, b) => parseInt(a) - parseInt(b));

  return (
    <div className="bg-white rounded-lg shadow border border-bronze-300">
      {/* Header Section */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Backlog</h2>
        <p className="text-sm text-gray-600 mt-1">{totalStories} total items</p>
      </div>

      {/* Accordion Sections */}
      <div>
        {sortedPhases.map((phase) => {
          const stories = backlog[phase] || [];
          const isExpanded = expandedPhase === phase;

          return (
            <div key={phase}>
              {/* Phase Button */}
              <button
                onClick={() => setExpandedPhase(isExpanded ? null : phase)}
                className="w-full px-6 py-4 hover:bg-gray-50 transition-colors border-b border-gray-200 flex justify-between items-center"
              >
                <div className="text-left flex items-center gap-3">
                  <span className="font-medium text-gray-900">Phase {phase}</span>
                  <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm font-semibold">
                    {stories.length}
                  </span>
                </div>
                <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 space-y-3">
                  {stories.map((story, index) => (
                    <div key={index} className="border-l-4 border-bronze-300 pl-4">
                      <p className="font-medium text-gray-900">{story.id}</p>
                      <p className="text-xs text-gray-600">{story.title}</p>
                      <span className="inline-block mt-1 px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded">
                        {story.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Backlog;
