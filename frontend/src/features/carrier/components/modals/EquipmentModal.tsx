import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  CarrierEquipmentDTO,
  EquipmentFormData,
  equipmentFormSchema,
  EquipmentTypeEnum,
  EquipmentConditionEnum,
} from '../../schemas/carrier.schemas';
import { useAddEquipment, useUpdateEquipment } from '../../hooks/useCarrierProfile';

interface EquipmentModalProps {
  equipment: CarrierEquipmentDTO | null;
  onClose: () => void;
}

export default function EquipmentModal({ equipment, onClose }: EquipmentModalProps) {
  const addEquipment = useAddEquipment();
  const updateEquipment = useUpdateEquipment();
  const isEditing = !!equipment;
  const isSubmitting = addEquipment.isPending || updateEquipment.isPending;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentFormSchema),
    defaultValues: equipment
      ? {
          equipmentType: equipment.equipmentType,
          lengthFeet: equipment.lengthFeet,
          widthFeet: equipment.widthFeet,
          heightFeet: equipment.heightFeet,
          capacityLbs: equipment.capacityLbs,
          equipmentCondition: equipment.equipmentCondition,
          yearModel: equipment.yearModel,
        }
      : undefined,
  });

  const onSubmit = async (data: EquipmentFormData) => {
    try {
      if (isEditing && equipment) {
        await updateEquipment.mutateAsync({ id: equipment.id, data });
        toast.success('Equipment updated');
      } else {
        await addEquipment.mutateAsync(data);
        toast.success('Equipment added');
      }
      reset();
      onClose();
    } catch (error) {
      toast.error(
        isEditing
          ? 'Failed to update equipment'
          : 'Failed to add equipment'
      );
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-label={isEditing ? 'Edit equipment' : 'Add equipment'}
      aria-modal="true"
    >
      <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            {isEditing ? 'Edit Equipment' : 'Add Equipment'}
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
          {/* Equipment Type */}
          <div>
            <label htmlFor="equipmentType" className="block text-white font-semibold mb-2">
              Equipment Type <span className="text-red-500">*</span>
            </label>
            <select
              id="equipmentType"
              {...register('equipmentType')}
              className="w-full h-12 bg-slate-900 border border-slate-700 text-white rounded px-4 focus:border-blue-500 focus:outline-none"
              aria-required="true"
            >
              <option value="">Select equipment type</option>
              {EquipmentTypeEnum.options.map((type) => (
                <option key={type} value={type}>
                  {type.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
            {errors.equipmentType && (
              <p role="alert" className="text-red-400 text-sm mt-1">
                {errors.equipmentType.message}
              </p>
            )}
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="lengthFeet" className="block text-white font-semibold mb-2 text-sm">
                Length <span className="text-red-500">*</span>
              </label>
              <input
                id="lengthFeet"
                type="number"
                {...register('lengthFeet', { valueAsNumber: true })}
                className="w-full h-12 bg-slate-900 border border-slate-700 text-white rounded px-4 focus:border-blue-500 focus:outline-none"
                placeholder="48"
                aria-required="true"
              />
              {errors.lengthFeet && (
                <p role="alert" className="text-red-400 text-xs mt-1">
                  {errors.lengthFeet.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="widthFeet" className="block text-white font-semibold mb-2 text-sm">
                Width <span className="text-red-500">*</span>
              </label>
              <input
                id="widthFeet"
                type="number"
                {...register('widthFeet', { valueAsNumber: true })}
                className="w-full h-12 bg-slate-900 border border-slate-700 text-white rounded px-4 focus:border-blue-500 focus:outline-none"
                placeholder="8.5"
                aria-required="true"
              />
              {errors.widthFeet && (
                <p role="alert" className="text-red-400 text-xs mt-1">
                  {errors.widthFeet.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="heightFeet" className="block text-white font-semibold mb-2 text-sm">
                Height <span className="text-red-500">*</span>
              </label>
              <input
                id="heightFeet"
                type="number"
                {...register('heightFeet', { valueAsNumber: true })}
                className="w-full h-12 bg-slate-900 border border-slate-700 text-white rounded px-4 focus:border-blue-500 focus:outline-none"
                placeholder="6"
                aria-required="true"
              />
              {errors.heightFeet && (
                <p role="alert" className="text-red-400 text-xs mt-1">
                  {errors.heightFeet.message}
                </p>
              )}
            </div>
          </div>

          {/* Capacity */}
          <div>
            <label htmlFor="capacityLbs" className="block text-white font-semibold mb-2">
              Capacity (lbs) <span className="text-red-500">*</span>
            </label>
            <input
              id="capacityLbs"
              type="number"
              {...register('capacityLbs', { valueAsNumber: true })}
              className="w-full h-12 bg-slate-900 border border-slate-700 text-white rounded px-4 focus:border-blue-500 focus:outline-none"
              placeholder="45000"
              aria-required="true"
            />
            {errors.capacityLbs && (
              <p role="alert" className="text-red-400 text-sm mt-1">
                {errors.capacityLbs.message}
              </p>
            )}
          </div>

          {/* Condition */}
          <div>
            <label className="block text-white font-semibold mb-2">
              Equipment Condition <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {EquipmentConditionEnum.options.map((condition) => (
                <label key={condition} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    value={condition}
                    {...register('equipmentCondition')}
                    className="w-4 h-4 cursor-pointer"
                    aria-label={`${condition}`}
                  />
                  <span className="text-slate-300">{condition}</span>
                </label>
              ))}
            </div>
            {errors.equipmentCondition && (
              <p role="alert" className="text-red-400 text-sm mt-1">
                {errors.equipmentCondition.message}
              </p>
            )}
          </div>

          {/* Year/Model */}
          <div>
            <label htmlFor="yearModel" className="block text-white font-semibold mb-2">
              Year/Model (optional)
            </label>
            <input
              id="yearModel"
              type="text"
              {...register('yearModel')}
              className="w-full h-12 bg-slate-900 border border-slate-700 text-white rounded px-4 focus:border-blue-500 focus:outline-none"
              placeholder="2022"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-12 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded transition-colors"
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Equipment' : 'Add Equipment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
