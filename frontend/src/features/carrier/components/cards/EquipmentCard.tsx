import { useState } from 'react';
import { CarrierEquipmentDTO } from '../../schemas/carrier.schemas';
import { useDeleteEquipment } from '../../hooks/useCarrierProfile';
import { toast } from 'sonner';

interface EquipmentCardProps {
  equipment: CarrierEquipmentDTO;
  onEdit: (equipment: CarrierEquipmentDTO) => void;
}

const equipmentTypeEmoji: Record<string, string> = {
  FLATBED: '🚛',
  DRY_VAN: '🚐',
  REFRIGERATED: '❄️',
  TANKER: '🛢️',
  SPECIALIZED: '⚙️',
};

const conditionColors: Record<string, string> = {
  GOOD: 'text-teal-400',
  FAIR: 'text-yellow-400',
  NEEDS_REPAIR: 'text-red-400',
};

export default function EquipmentCard({ equipment, onEdit }: EquipmentCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const deleteEquipment = useDeleteEquipment();

  const handleDelete = async () => {
    try {
      await deleteEquipment.mutateAsync(equipment.id);
      toast.success('Equipment deleted');
      setShowConfirm(false);
    } catch (error) {
      toast.error('Failed to delete equipment');
    }
  };

  const emoji = equipmentTypeEmoji[equipment.equipmentType] || '🚛';
  const conditionColor = conditionColors[equipment.equipmentCondition] || 'text-slate-400';

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <span>{emoji}</span>
            <span>
              {equipment.equipmentType.replace(/_/g, ' ')} {equipment.lengthFeet}'
            </span>
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            Capacity: {equipment.capacityLbs.toLocaleString()} lbs | Condition:{' '}
            <span className={conditionColor}>{equipment.equipmentCondition}</span>
          </p>
        </div>
      </div>

      {equipment.yearModel && (
        <p className="text-slate-400 text-sm mb-3">Year: {equipment.yearModel}</p>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => onEdit(equipment)}
          className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors"
          aria-label={`Edit ${equipment.equipmentType}`}
        >
          Edit
        </button>
        <button
          onClick={() => setShowConfirm(true)}
          className="flex-1 h-10 bg-red-600 hover:bg-red-700 text-white font-medium rounded transition-colors"
          aria-label={`Delete ${equipment.equipmentType}`}
        >
          Delete
        </button>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          role="alertdialog"
          aria-label="Confirm delete"
        >
          <div className="bg-slate-800 rounded-lg p-6 max-w-sm">
            <h4 className="text-white font-bold mb-2">Delete Equipment?</h4>
            <p className="text-slate-300 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 h-10 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteEquipment.isPending}
                className="flex-1 h-10 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded transition-colors"
              >
                {deleteEquipment.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
