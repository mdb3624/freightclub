import React from 'react';
import { Carrier } from '../types/carrier';

interface CarrierResultRowProps {
  carrier: Carrier;
  onClick: (carrier: Carrier) => void;
  index: number;
}

export const CarrierResultRow: React.FC<CarrierResultRowProps> = ({
  carrier,
  onClick,
  index,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(carrier);
    }
  };

  const equipmentText = carrier.equipmentTypes.join(', ');
  const ratingText = `Rating: ${carrier.rating}/5 | ${carrier.phone}`;

  return (
    <div
      data-testid={`carrier-result-row-${index}`}
      role="button"
      tabIndex={0}
      className="flex flex-col gap-2 p-3 rounded-md border border-gray-200 bg-gray-50 cursor-pointer transition-colors hover:bg-blue-50"
      onClick={() => onClick(carrier)}
      onKeyDown={handleKeyDown}
    >
      {/* Carrier Name */}
      <p className="font-bold text-gray-900">
        {carrier.name}
      </p>

      {/* Equipment Types */}
      <p className="text-sm text-gray-600">
        Equipment: {equipmentText}
      </p>

      {/* Rating and Phone */}
      <p className="text-sm text-gray-600">
        {ratingText}
      </p>
    </div>
  );
};
