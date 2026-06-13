import React from 'react';

interface QuickActionsPanelProps {
  onPostLoad: () => void;
  onGetQuote: () => void;
  onTrackShipments: () => void;
  onPreferredCarriers: () => void;
  onCarrierSearch?: () => void;
  isLoading?: boolean;
  loadingButtonId?: string | null;
}

export const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({
  onPostLoad,
  onGetQuote,
  onTrackShipments,
  onPreferredCarriers,
  onCarrierSearch,
  isLoading = false,
  loadingButtonId = null,
}) => {
  const actions = [
    {
      id: 'quick-actions-post-load',
      label: 'Post Load',
      icon: '📤',
      handler: onPostLoad,
    },
    {
      id: 'quick-actions-quote',
      label: 'Get A Quote',
      icon: '💬',
      handler: onGetQuote,
    },
    {
      id: 'quick-actions-track',
      label: 'Track Shipments',
      icon: '📦',
      handler: onTrackShipments,
    },
    {
      id: 'quick-actions-carriers',
      label: 'Preferred Carriers',
      icon: '⭐',
      handler: onPreferredCarriers,
    },
    ...(onCarrierSearch ? [{
      id: 'quick-actions-search-carriers',
      label: 'Search Carriers',
      icon: '🔍',
      handler: onCarrierSearch,
    }] : []),
  ];

  return (
    <div
      data-testid="dashboard-quick-actions-panel"
      role="region"
      aria-label="Quick Actions"
      className="col-span-4 border border-widget rounded-md p-6 bg-white shadow-subtle"
    >
      <div className="space-y-2">
        {actions.map((action) => {
          const isButtonLoading = isLoading && loadingButtonId === action.id;
          return (
            <button
              key={action.id}
              data-testid={action.id}
              onClick={action.handler}
              disabled={isButtonLoading}
              className={`w-full px-4 py-2 rounded text-white font-medium flex items-center justify-center gap-2 transition-all ${
                isButtonLoading
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'btn-bronze hover:bg-opacity-90'
              }`}
            >
              {isButtonLoading && (
                <span className="spinner inline-block w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
              )}
              <span>{action.icon}</span>
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
