import { useState } from 'react';
import { useDeleteLane } from '../../hooks/useCarrierProfile';
import { CarrierLaneDTO } from '../../schemas/carrier.schemas';
import { toast } from 'sonner';

interface LaneCardProps {
  lane: CarrierLaneDTO;
  onEdit: (lane: CarrierLaneDTO) => void;
}

export default function LaneCard({ lane, onEdit }: LaneCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const deleteeMutation = useDeleteLane();

  const handleDelete = async () => {
    try {
      await deleteeMutation.mutateAsync(lane.id);
      toast.success('Lane deleted successfully');
      setShowConfirm(false);
    } catch (error) {
      toast.error('Failed to delete lane');
    }
  };

  const formatRate = (cents?: number) => {
    if (!cents) return 'Any rate';
    return `$${(cents / 100).toFixed(2)}/mi`;
  };

  const formatRegion = (r: string) =>
    r.charAt(0).toUpperCase() + r.slice(1).toLowerCase().replace(/_/g, ' ');

  const frequencyLabel =
    lane.frequencyPreference === 'ANY'
      ? 'Any frequency'
      : `${lane.frequencyPreference.charAt(0).toUpperCase()}${lane.frequencyPreference.slice(1).toLowerCase()} loads`;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors">
      {/* Lane Route */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">
            {formatRegion(lane.originRegion)} → {formatRegion(lane.destinationRegion)}
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            {formatRate(lane.minRateCents)} • {frequencyLabel}
          </p>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-medium ${
          lane.status === 'ACTIVE'
            ? 'bg-green-900/30 text-green-300'
            : 'bg-yellow-900/30 text-yellow-300'
        }`}>
          {lane.status}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(lane)}
          className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors text-sm font-medium"
          aria-label={`Edit lane from ${formatRegion(lane.originRegion)} to ${formatRegion(lane.destinationRegion)}`}
        >
          Edit
        </button>
        <button
          onClick={() => setShowConfirm(true)}
          className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-red-400 rounded transition-colors"
          aria-label={`Delete lane from ${formatRegion(lane.originRegion)} to ${formatRegion(lane.destinationRegion)}`}
        >
          🗑
        </button>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-sm">
            <h2 className="text-lg font-semibold text-white mb-2">Delete Lane?</h2>
            <p className="text-slate-300 mb-4">
              This will remove the lane preference from {lane.originRegion} to {lane.destinationRegion}.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteeMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors disabled:opacity-50"
              >
                {deleteeMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
