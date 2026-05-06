
import { CarrierEquipmentDTO, CarrierAvailabilityDTO } from '../schemas/carrier.schemas';

interface ProfileHeaderProps {
  equipment: CarrierEquipmentDTO[];
  availability: CarrierAvailabilityDTO | null | undefined;
  isLoading: boolean;
}

function getStatusIndicator(availability: CarrierAvailabilityDTO | null | undefined) {
  if (!availability) return { color: 'bg-slate-500', text: 'No availability set', emoji: '⚪' };

  if (availability.currentlyOnLoad) {
    return { color: 'bg-amber-500', text: 'On Load', emoji: '🟡' };
  }

  // Check if currently within availability window
  const now = new Date();
  const [startHour, startMin] = availability.availableStartTime.split(':').map(Number);
  const [endHour, endMin] = availability.availableEndTime.split(':').map(Number);
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const startTime = startHour * 60 + startMin;
  const endTime = endHour * 60 + endMin;

  const isWithinWindow = currentTime >= startTime && currentTime <= endTime;
  const dayOfWeek = now.getDay();
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;

  const isAvailable =
    isWithinWindow &&
    (availability.availableDays === 'MON_SUN' ||
      (availability.availableDays === 'MON_FRI' && isWeekday) ||
      (availability.availableDays === 'WEEKENDS' && !isWeekday));

  if (isAvailable) {
    return { color: 'bg-teal-500', text: 'Available', emoji: '🟢' };
  }

  return { color: 'bg-red-500', text: 'Unavailable', emoji: '🔴' };
}

export default function ProfileHeader({
  equipment,
  availability,
  isLoading,
}: ProfileHeaderProps) {
  const status = getStatusIndicator(availability);

  if (isLoading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 animate-pulse">
        <div className="h-6 bg-slate-700 rounded w-1/3"></div>
      </div>
    );
  }

  return (
    <div
      className="bg-slate-800 border border-slate-700 rounded-lg p-6"
      aria-label="Profile summary"
    >
      {/* Rating Section */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">⭐</span>
        <span className="text-white font-bold">Your Profile: </span>
        <span className="text-slate-300">4.8/5 (87 ratings)</span>
      </div>

      {/* Status Section */}
      <div className="flex items-center gap-3">
        <span className={`${status.color} rounded-full w-4 h-4`}></span>
        <div>
          <p className="text-white font-semibold">
            {status.emoji} {status.text}
          </p>
          {availability && (
            <p className="text-slate-400 text-sm">
              {availability.availableDays.replace(/_/g, '–')}, {availability.availableStartTime}–
              {availability.availableEndTime} {availability.timeZone}
            </p>
          )}
        </div>
      </div>

      {/* Equipment Count */}
      {equipment.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <p className="text-slate-400 text-sm">
            {equipment.length} equipment unit{equipment.length !== 1 ? 's' : ''} in inventory
          </p>
        </div>
      )}
    </div>
  );
}
