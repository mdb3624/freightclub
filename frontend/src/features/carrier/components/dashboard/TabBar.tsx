import React from 'react';

type TabType = 'my-stats' | 'available-loads' | 'quick-actions';

interface TabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

/**
 * AC-1: Tab bar (48px fixed)
 * Three tabs: My Stats | Available Loads | Quick Actions
 * Tap-only navigation (no swipe)
 */

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: TabType; label: string }[] = [
    { id: 'my-stats', label: 'My Stats' },
    { id: 'available-loads', label: 'Available Loads' },
    { id: 'quick-actions', label: 'Quick Actions' }
  ];

  return (
    <div
      style={{
        width: '100%',
        height: 48,
        display: 'flex',
        gap: 0,
        padding: 0
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          data-testid={`tab-button-${tab.id}`}
          onClick={() => onTabChange(tab.id)}
          style={{
            flex: 1,
            height: 48,
            backgroundColor: activeTab === tab.id ? '#333333' : 'transparent',
            border: 'none',
            borderBottom: activeTab === tab.id ? '3px solid #B08D57' : '1px solid #2A2F37',
            color: activeTab === tab.id ? '#FFFFFF' : '#B0B0B0',
            fontSize: 12,
            fontWeight: 600,
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 200ms ease',
            minWidth: 48,
            minHeight: 48
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
