import React from 'react';
import { useDashboardData } from './hooks/useDashboardData';
import { DashboardLayout } from './components/DashboardLayout';

function App() {
  const { data, loading, error, refresh } = useDashboardData();

  return (
    <DashboardLayout
      data={data}
      loading={loading}
      error={error}
      lastUpdated={data?.lastUpdated || new Date().toISOString()}
      onRefresh={refresh}
    />
  );
}

export default App;
