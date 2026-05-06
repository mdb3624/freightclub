import { useState } from 'react';
import { CarrierLaneDTO } from '../../schemas/carrier.schemas';
import LaneCard from '../cards/LaneCard';
import LaneModal from '../modals/LaneModal';

interface LanesTabProps {
  lanes: CarrierLaneDTO[];
  isLoading: boolean;
}

export default function LanesTab({ lanes, isLoading }: LanesTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLane, setEditingLane] = useState<CarrierLaneDTO | null>(null);

  const handleEdit = (lane: CarrierLaneDTO) => {
    setEditingLane(lane);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingLane(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLane(null);
  };

  if (isLoading) {
    return <div className="text-slate-400">Loading preferred lanes...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Lanes List */}
      <div className="space-y-3">
        {lanes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400">No preferred lanes set yet.</p>
            <p className="text-slate-500 text-sm mt-2">Add your first lane preference to help with load matching.</p>
          </div>
        ) : (
          lanes.map((lane) => (
            <LaneCard
              key={lane.id}
              lane={lane}
              onEdit={handleEdit}
            />
          ))
        )}
      </div>

      {/* Add Lane Button */}
      <button
        onClick={handleAdd}
        className="w-full mt-6 h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
        aria-label="Add new lane"
      >
        <span>+</span> Add Lane
      </button>

      {/* Lane Modal */}
      {isModalOpen && (
        <LaneModal
          lane={editingLane}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
