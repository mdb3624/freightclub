import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  CarrierLaneDTO,
  LaneFormData,
  laneFormSchema,
  FrequencyPreferenceEnum,
} from '../../schemas/carrier.schemas';
import { useAddLane, useUpdateLane } from '../../hooks/useCarrierProfile';

interface LaneModalProps {
  lane: CarrierLaneDTO | null;
  onClose: () => void;
}

const REGIONS = [
  'NORTHEAST',
  'SOUTHEAST',
  'MIDWEST',
  'SOUTH',
  'SOUTHWEST',
  'NORTHWEST',
  'CALIFORNIA',
  'TEXAS',
];

const formatRegion = (r: string) =>
  r.charAt(0).toUpperCase() + r.slice(1).toLowerCase().replace(/_/g, ' ');

const formatFrequency = (f: string) =>
  f === 'ANY' ? 'Any frequency' : `${f.charAt(0).toUpperCase()}${f.slice(1).toLowerCase()} loads`;

export default function LaneModal({ lane, onClose }: LaneModalProps) {
  const addLane = useAddLane();
  const updateLane = useUpdateLane();
  const isEditing = !!lane;
  const isSubmitting = addLane.isPending || updateLane.isPending;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LaneFormData>({
    resolver: zodResolver(laneFormSchema),
    defaultValues: lane
      ? {
          originRegion: lane.originRegion,
          destinationRegion: lane.destinationRegion,
          minRateCents: lane.minRateCents,
          frequencyPreference: lane.frequencyPreference,
        }
      : undefined,
  });

  const onSubmit = async (data: LaneFormData) => {
    try {
      if (isEditing && lane) {
        await updateLane.mutateAsync({ id: lane.id, data });
        toast.success('Lane updated');
      } else {
        await addLane.mutateAsync(data);
        toast.success('Lane added');
      }
      reset();
      onClose();
    } catch (error) {
      toast.error(
        isEditing
          ? 'Failed to update lane'
          : 'Failed to add lane'
      );
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-label={isEditing ? 'Edit lane' : 'Add lane'}
      aria-modal="true"
    >
      <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            {isEditing ? 'Edit Lane' : 'Add Lane'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl leading-none"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Origin Region */}
          <div>
            <label htmlFor="originRegion" className="block text-white font-semibold mb-2">
              Origin Region <span className="text-red-500">*</span>
            </label>
            <select
              id="originRegion"
              {...register('originRegion')}
              className="w-full h-12 bg-slate-900 border border-slate-700 text-white rounded px-4 focus:border-blue-500 focus:outline-none"
              aria-required="true"
            >
              <option value="">Select origin region</option>
              {REGIONS.map((region) => (
                <option key={region} value={region}>
                  {formatRegion(region)}
                </option>
              ))}
            </select>
            {errors.originRegion && (
              <p className="text-red-500 text-sm mt-1" role="alert">
                {errors.originRegion.message}
              </p>
            )}
          </div>

          {/* Destination Region */}
          <div>
            <label htmlFor="destinationRegion" className="block text-white font-semibold mb-2">
              Destination Region <span className="text-red-500">*</span>
            </label>
            <select
              id="destinationRegion"
              {...register('destinationRegion')}
              className="w-full h-12 bg-slate-900 border border-slate-700 text-white rounded px-4 focus:border-blue-500 focus:outline-none"
              aria-required="true"
            >
              <option value="">Select destination region</option>
              {REGIONS.map((region) => (
                <option key={region} value={region}>
                  {formatRegion(region)}
                </option>
              ))}
            </select>
            {errors.destinationRegion && (
              <p className="text-red-500 text-sm mt-1" role="alert">
                {errors.destinationRegion.message}
              </p>
            )}
          </div>

          {/* Minimum Rate */}
          <div>
            <label htmlFor="minRateCents" className="block text-white font-semibold mb-2">
              Minimum Rate ($/mi)
            </label>
            <input
              id="minRateCents"
              type="number"
              step="0.01"
              {...register('minRateCents', { valueAsNumber: true })}
              placeholder="Optional (e.g., 1.75)"
              className="w-full h-12 bg-slate-900 border border-slate-700 text-white rounded px-4 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              aria-label="Minimum rate per mile in dollars"
            />
            {errors.minRateCents && (
              <p className="text-red-500 text-sm mt-1" role="alert">
                {errors.minRateCents.message}
              </p>
            )}
          </div>

          {/* Frequency Preference */}
          <div>
            <label htmlFor="frequencyPreference" className="block text-white font-semibold mb-2">
              Frequency Preference <span className="text-red-500">*</span>
            </label>
            <select
              id="frequencyPreference"
              {...register('frequencyPreference')}
              className="w-full h-12 bg-slate-900 border border-slate-700 text-white rounded px-4 focus:border-blue-500 focus:outline-none"
              aria-required="true"
            >
              <option value="">Select frequency</option>
              {FrequencyPreferenceEnum.options.map((freq) => (
                <option key={freq} value={freq}>
                  {formatFrequency(freq)}
                </option>
              ))}
            </select>
            {errors.frequencyPreference && (
              <p className="text-red-500 text-sm mt-1" role="alert">
                {errors.frequencyPreference.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-semibold rounded transition-colors"
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Lane' : 'Add Lane'}
          </button>
        </form>
      </div>
    </div>
  );
}
