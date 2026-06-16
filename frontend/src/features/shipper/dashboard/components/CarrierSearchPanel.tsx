/**
 * CarrierSearchPanel Component
 * Main stateful component integrating form, hook, and results display
 *
 * Feature: US-825 Task 5 (Carrier Search Panel)
 * AC-2: Search form with origin, destination, equipment fields
 * AC-3: Results display with skeleton loaders, error handling, and carrier selection
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCarrierSearch } from '../hooks/useCarrierSearch';
import { Carrier } from '../types/carrier';
import { SkeletonLoader } from './SkeletonLoader';
import { CarrierResultRow } from './CarrierResultRow';

// Form validation schema
const carrierSearchSchema = z.object({
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  equipment: z.string().optional(),
});

type CarrierSearchFormData = z.infer<typeof carrierSearchSchema>;

interface CarrierSearchPanelProps {
  onCarrierSelect?: (carrier: Carrier) => void;
}

/**
 * CarrierSearchPanel
 * Stateful component managing carrier search with form validation and results display
 *
 * Responsibilities:
 * - Render search form with origin, destination, equipment fields
 * - Validate form inputs using Zod schema
 * - Call useCarrierSearch hook on form submission
 * - Display loading skeletons during API call
 * - Display carrier results or error/no-results messages
 * - Handle carrier selection via onCarrierSelect callback
 */
export const CarrierSearchPanel: React.FC<CarrierSearchPanelProps> = ({
  onCarrierSelect,
}) => {
  const { status, data, search } = useCarrierSearch();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CarrierSearchFormData>({
    resolver: zodResolver(carrierSearchSchema),
  });

  const onSubmit = (formData: CarrierSearchFormData) => {
    search({
      origin: formData.origin,
      destination: formData.destination,
      ...(formData.equipment && { equipment: formData.equipment }),
    });
  };

  const equipmentOptions = [
    'Dry Van',
    'Flatbed',
    'Refrigerated',
    'Tanker',
    'Box Truck',
    'Sprinter Van',
  ];

  return (
    <div
      data-testid="dashboard-carrier-search-panel"
      role="region"
      aria-label="Carrier Search"
      className="col-span-5 border border-widget rounded-md p-6 bg-white shadow-subtle"
    >
      {/* Search Form */}
      <div className="mb-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Origin Field */}
          <div>
            <label htmlFor="origin" className="block text-sm font-medium text-gray-700 mb-1">
              Origin
            </label>
            <input
              id="origin"
              data-testid="carrier-search-origin"
              type="text"
              placeholder="City, State, or Zip"
              {...register('origin')}
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.origin ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.origin && (
              <p className="mt-1 text-sm text-red-600">{errors.origin.message}</p>
            )}
          </div>

          {/* Destination Field */}
          <div>
            <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
              Destination
            </label>
            <input
              id="destination"
              data-testid="carrier-search-destination"
              type="text"
              placeholder="City, State, or Zip"
              {...register('destination')}
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.destination ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.destination && (
              <p className="mt-1 text-sm text-red-600">{errors.destination.message}</p>
            )}
          </div>

          {/* Equipment Field */}
          <div>
            <label htmlFor="equipment" className="block text-sm font-medium text-gray-700 mb-1">
              Equipment (Optional)
            </label>
            <select
              id="equipment"
              data-testid="carrier-search-equipment"
              {...register('equipment')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Equipment Type --</option>
              {equipmentOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            data-testid="carrier-search-submit-btn"
            className="w-full px-4 py-2 btn-bronze font-medium rounded-md"
          >
            Find Carriers
          </button>
        </form>
      </div>

      {/* Results Area */}
      <div className="mt-6">
        {/* Loading State */}
        {status === 'loading' && (
          <SkeletonLoader rowCount={3} rowHeight="60px" />
        )}

        {/* Success State */}
        {status === 'success' && data.length > 0 && (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {data.map((carrier, index) => (
              <CarrierResultRow
                key={carrier.id}
                carrier={carrier}
                index={index}
                onClick={(selectedCarrier) => {
                  onCarrierSelect?.(selectedCarrier);
                }}
              />
            ))}
          </div>
        )}

        {/* No Results State */}
        {status === 'no-results' && (
          <div className="text-center py-8 text-gray-500">
            <p>No carriers found for your search.</p>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="text-center py-8 bg-red-50 rounded-md border border-red-200">
            <p className="text-red-600">Error searching for carriers. Please try again.</p>
          </div>
        )}
      </div>
    </div>
  );
};
