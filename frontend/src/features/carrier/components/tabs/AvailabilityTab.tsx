import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  CarrierAvailabilityDTO,
  AvailabilityFormData,
  availabilityFormSchema,
  AvailableDaysEnum,
} from '../../schemas/carrier.schemas';
import { useSetAvailability } from '../../hooks/useCarrierProfile';

interface AvailabilityTabProps {
  availability: CarrierAvailabilityDTO | undefined;
  isLoading: boolean;
}

const TIME_ZONES = ['EST', 'CST', 'MST', 'PST', 'UTC'];

export default function AvailabilityTab({ availability, isLoading }: AvailabilityTabProps) {
  const setAvailability = useSetAvailability();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AvailabilityFormData>({
    resolver: zodResolver(availabilityFormSchema),
    defaultValues: availability
      ? {
          availableDays: availability.availableDays,
          availableStartTime: availability.availableStartTime,
          availableEndTime: availability.availableEndTime,
          timeZone: availability.timeZone,
          currentlyOnLoad: availability.currentlyOnLoad,
        }
      : {
          availableDays: 'MON_FRI',
          availableStartTime: '06:00',
          availableEndTime: '22:00',
          timeZone: 'EST',
          currentlyOnLoad: false,
        },
  });

  const onSubmit = async (data: AvailabilityFormData) => {
    try {
      await setAvailability.mutateAsync(data);
      toast.success('Availability updated');
      reset(data);
    } catch (error) {
      toast.error('Failed to update availability');
    }
  };

  if (isLoading) {
    return <div className="text-slate-400">Loading availability...</div>;
  }

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Status Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Current Status</h3>
          <div className="flex items-center gap-4 p-4 bg-slate-900 rounded-lg">
            <div
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ backgroundColor: availability?.currentlyOnLoad ? '#EF4444' : '#00E5A8' }}
              aria-hidden="true"
            />
            <div className="flex-1">
              <p className="text-white font-medium">
                {availability?.currentlyOnLoad ? 'Currently on a load' : 'Available for loads'}
              </p>
              <p className="text-slate-400 text-sm">
                {availability?.currentlyOnLoad
                  ? 'You are marked unavailable for new loads'
                  : 'You will appear in load matching'}
              </p>
            </div>
          </div>
        </div>

        {/* Availability Days */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Days Available</h3>

          <div>
            <label htmlFor="availableDays" className="block text-white font-semibold mb-2">
              Select your availability pattern <span className="text-red-500">*</span>
            </label>
            <select
              id="availableDays"
              {...register('availableDays')}
              className="w-full h-12 bg-slate-900 border border-slate-700 text-white rounded px-4 focus:border-blue-500 focus:outline-none"
              aria-required="true"
            >
              <option value="">Select days</option>
              {AvailableDaysEnum.options.map((days) => (
                <option key={days} value={days}>
                  {days === 'MON_FRI'
                    ? 'Monday - Friday'
                    : days === 'MON_SUN'
                    ? 'Monday - Sunday (Always available)'
                    : days === 'WEEKENDS'
                    ? 'Weekends only'
                    : 'Custom schedule'}
                </option>
              ))}
            </select>
            {errors.availableDays && (
              <p className="text-red-500 text-sm mt-1" role="alert">
                {errors.availableDays.message}
              </p>
            )}
          </div>
        </div>

        {/* Time Window */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Hours of Operation</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="availableStartTime" className="block text-white font-semibold mb-2">
                Start Time <span className="text-red-500">*</span>
              </label>
              <input
                id="availableStartTime"
                type="time"
                {...register('availableStartTime')}
                className="w-full h-12 bg-slate-900 border border-slate-700 text-white rounded px-4 focus:border-blue-500 focus:outline-none"
                aria-required="true"
              />
              {errors.availableStartTime && (
                <p className="text-red-500 text-sm mt-1" role="alert">
                  {errors.availableStartTime.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="availableEndTime" className="block text-white font-semibold mb-2">
                End Time <span className="text-red-500">*</span>
              </label>
              <input
                id="availableEndTime"
                type="time"
                {...register('availableEndTime')}
                className="w-full h-12 bg-slate-900 border border-slate-700 text-white rounded px-4 focus:border-blue-500 focus:outline-none"
                aria-required="true"
              />
              {errors.availableEndTime && (
                <p className="text-red-500 text-sm mt-1" role="alert">
                  {errors.availableEndTime.message}
                </p>
              )}
            </div>
          </div>

          {errors.availableEndTime?.message === 'Start time must be before end time' && (
            <p className="text-red-500 text-sm" role="alert">
              Start time must be before end time
            </p>
          )}
        </div>

        {/* Time Zone */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Time Zone</h3>

          <div>
            <label htmlFor="timeZone" className="block text-white font-semibold mb-2">
              Select your time zone <span className="text-red-500">*</span>
            </label>
            <select
              id="timeZone"
              {...register('timeZone')}
              className="w-full h-12 bg-slate-900 border border-slate-700 text-white rounded px-4 focus:border-blue-500 focus:outline-none"
              aria-required="true"
            >
              <option value="">Select time zone</option>
              {TIME_ZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
            {errors.timeZone && (
              <p className="text-red-500 text-sm mt-1" role="alert">
                {errors.timeZone.message}
              </p>
            )}
          </div>
        </div>

        {/* Load Status */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Load Status</h3>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('currentlyOnLoad')}
              className="w-5 h-5 rounded bg-slate-900 border border-slate-600 cursor-pointer"
              aria-label="Currently on load"
            />
            <span className="text-white font-medium">Currently on a load</span>
          </label>
          <p className="text-slate-400 text-sm">Check this box if you're currently unavailable for new loads.</p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={setAvailability.isPending}
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-semibold rounded transition-colors"
        >
          {setAvailability.isPending ? 'Saving...' : 'Update Availability'}
        </button>
      </form>
    </div>
  );
}
