import { useState, useEffect } from 'react';
import type { Story, CurrentSprint, Dashboard } from '../../backend/src/types';

interface DashboardData {
  activeStories: Story[];
  currentSprint: CurrentSprint;
  backlog: Record<string, Story[]>;
  lastUpdated: string;
}

interface UseDashboardDataReturn {
  data: DashboardData | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useDashboardData(): UseDashboardDataReturn {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/dashboard');
      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard data: ${response.statusText}`);
      }
      const json = await response.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchDashboard();
  }, []);

  // Auto-refresh every 2 seconds
  useEffect(() => {
    const interval = setInterval(fetchDashboard, 2000);
    return () => clearInterval(interval);
  }, []);

  return { data, loading, error, refresh: fetchDashboard };
}
