import { useState } from 'react';
import { useEquipment, useLanes, useAvailability } from '../hooks/useCarrierProfile';
import EquipmentTab from './tabs/EquipmentTab';
import LanesTab from './tabs/LanesTab';
import AvailabilityTab from './tabs/AvailabilityTab';
import ProfileHeader from './ProfileHeader';

type TabType = 'equipment' | 'lanes' | 'availability';

interface CarrierProfileHubProps {
  truckerId: string;
}

export default function CarrierProfileHub({ truckerId }: CarrierProfileHubProps) {
  const [activeTab, setActiveTab] = useState<TabType>('equipment');

  const { data: equipment, isLoading: eqLoading } = useEquipment(truckerId);
  const { data: lanes, isLoading: laneLoading } = useLanes(truckerId);
  const { data: availability, isLoading: avLoading } = useAvailability(truckerId);

  const isLoading = eqLoading || laneLoading || avLoading;

  const tabs: Array<{ id: TabType; label: string }> = [
    { id: 'equipment', label: 'Equipment' },
    { id: 'lanes', label: 'Lanes' },
    { id: 'availability', label: 'Availability' },
  ];

  return (
    <main role="main" aria-label="Carrier Profile Management" className="bg-slate-900 min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">My Carrier Profile</h1>
          <button
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Menu"
          >
            ☰
          </button>
        </div>

        {/* Profile Header */}
        <ProfileHeader
          equipment={equipment || []}
          availability={availability}
          isLoading={isLoading}
        />

        {/* Tabs */}
        <nav aria-label="Profile tabs" className="mt-8 mb-6">
          <ul role="tablist" className="flex gap-4 border-b border-slate-700">
            {tabs.map((tab) => (
              <li key={tab.id} role="presentation">
                <button
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`${tab.id}-panel`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-400 border-b-2 border-blue-400'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Tab Panels */}
        <div>
          {activeTab === 'equipment' && (
            <div id="equipment-panel" role="tabpanel" aria-labelledby="equipment-tab">
              <EquipmentTab equipment={equipment || []} isLoading={eqLoading} />
            </div>
          )}

          {activeTab === 'lanes' && (
            <div id="lanes-panel" role="tabpanel" aria-labelledby="lanes-tab">
              <LanesTab lanes={lanes || []} isLoading={laneLoading} />
            </div>
          )}

          {activeTab === 'availability' && (
            <div id="availability-panel" role="tabpanel" aria-labelledby="availability-tab">
              <AvailabilityTab availability={availability || undefined} isLoading={avLoading} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
