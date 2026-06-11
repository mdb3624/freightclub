import { useNavigate } from 'react-router-dom';

export interface QuickActionHandlers {
  onPostLoad: () => void;
  onGetQuote: () => void;
  onTrackShipments: () => void;
  onPreferredCarriers: () => void;
}

export function useQuickActionNavigation(): QuickActionHandlers {
  const navigate = useNavigate();

  return {
    onPostLoad: () => navigate('/shipper/loads/new'),
    onGetQuote: () => navigate('/shipper/quote'),
    onTrackShipments: () => navigate('/dashboard/shipper/loads'),
    onPreferredCarriers: () => navigate('/settings/preferred-carriers'),
  };
}
