import React, { useState } from 'react';
import { QuickActionsPanel } from './components/QuickActionsPanel';
import { MessagesAlertsPanel } from './components/MessagesAlertsPanel';
import { useQuickActionNavigation } from './hooks/useQuickActionNavigation';

export const ShipperDashboardPage: React.FC = () => {
  const { onPostLoad, onGetQuote, onTrackShipments, onPreferredCarriers } = useQuickActionNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingButtonId, setLoadingButtonId] = useState<string | null>(null);

  const handleActionClick = (buttonId: string, handler: () => void) => {
    setIsLoading(true);
    setLoadingButtonId(buttonId);
    // Navigation happens immediately
    handler();
  };

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Row 1: Empty placeholder for other content */}
      <div className="col-span-12">
        {/* KPI Summary or other content would go here */}
      </div>

      {/* Row 2: Shipment Status + Quick Actions */}
      <div className="col-span-8 border border-widget rounded-md p-6 bg-white shadow-subtle" data-testid="dashboard-shipment-status-panel">
        <h3 className="text-lg font-semibold mb-4">Shipment Status Feed</h3>
        <p className="text-gray-600">Placeholder: Shipment Status content</p>
      </div>

      <QuickActionsPanel
        onPostLoad={() => handleActionClick('quick-actions-post-load', onPostLoad)}
        onGetQuote={() => handleActionClick('quick-actions-quote', onGetQuote)}
        onTrackShipments={() => handleActionClick('quick-actions-track', onTrackShipments)}
        onPreferredCarriers={() => handleActionClick('quick-actions-carriers', onPreferredCarriers)}
        isLoading={isLoading}
        loadingButtonId={loadingButtonId}
      />

      {/* Row 3: Messages and Alerts */}
      <MessagesAlertsPanel />
    </div>
  );
};
