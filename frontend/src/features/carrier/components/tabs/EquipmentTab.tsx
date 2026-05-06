import { useState } from 'react';
import { CarrierEquipmentDTO } from '../../schemas/carrier.schemas';
import EquipmentCard from '../cards/EquipmentCard';
import EquipmentModal from '../modals/EquipmentModal';

interface EquipmentTabProps {
  equipment: CarrierEquipmentDTO[];
  isLoading: boolean;
}

export default function EquipmentTab({ equipment, isLoading }: EquipmentTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<CarrierEquipmentDTO | null>(null);

  const handleEdit = (eq: CarrierEquipmentDTO) => {
    setEditingEquipment(eq);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingEquipment(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEquipment(null);
  };

  if (isLoading) {
    return <div className="text-slate-400">Loading equipment...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Equipment List */}
      <div className="space-y-3">
        {equipment.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400">No equipment added yet.</p>
            <p className="text-slate-500 text-sm mt-2">Add your first piece of equipment to get started.</p>
          </div>
        ) : (
          equipment.map((eq) => (
            <EquipmentCard
              key={eq.id}
              equipment={eq}
              onEdit={handleEdit}
            />
          ))
        )}
      </div>

      {/* Add Equipment Button */}
      <button
        onClick={handleAdd}
        className="w-full mt-6 h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
        aria-label="Add new equipment"
      >
        <span>+</span> Add Equipment
      </button>

      {/* Equipment Modal */}
      {isModalOpen && (
        <EquipmentModal
          equipment={editingEquipment}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
