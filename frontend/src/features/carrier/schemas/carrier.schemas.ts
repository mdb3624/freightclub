import { z } from 'zod';

export const EquipmentTypeEnum = z.enum([
  'FLATBED',
  'DRY_VAN',
  'REFRIGERATED',
  'TANKER',
  'SPECIALIZED',
]);

export const EquipmentConditionEnum = z.enum(['GOOD', 'FAIR', 'NEEDS_REPAIR']);

export const EquipmentStatusEnum = z.enum(['ACTIVE', 'INACTIVE']);

export const FrequencyPreferenceEnum = z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'ANY']);

export const LaneStatusEnum = z.enum(['ACTIVE', 'INACTIVE']);

export const AvailableDaysEnum = z.enum(['MON_FRI', 'WEEKENDS', 'MON_SUN', 'CUSTOM']);

// Equipment Schemas
export const equipmentFormSchema = z.object({
  equipmentType: EquipmentTypeEnum,
  lengthFeet: z.number().min(1, 'Length must be positive'),
  widthFeet: z.number().min(1, 'Width must be positive'),
  heightFeet: z.number().min(1, 'Height must be positive'),
  capacityLbs: z.number().min(1, 'Capacity must be positive'),
  equipmentCondition: EquipmentConditionEnum,
  yearModel: z.string().optional(),
});

export type EquipmentFormData = z.infer<typeof equipmentFormSchema>;

export const carriEquipmentDTOSchema = equipmentFormSchema.extend({
  id: z.string(),
  status: EquipmentStatusEnum,
  createdAt: z.string().or(z.date()),
});

export type CarrierEquipmentDTO = z.infer<typeof carriEquipmentDTOSchema>;

// Lane Schemas
export const laneFormSchema = z.object({
  originRegion: z.string().min(1, 'Origin region is required'),
  destinationRegion: z.string().min(1, 'Destination region is required'),
  minRateCents: z.number().min(0).optional(),
  frequencyPreference: FrequencyPreferenceEnum,
});

export type LaneFormData = z.infer<typeof laneFormSchema>;

export const carrierLaneDTOSchema = laneFormSchema.extend({
  id: z.string(),
  status: LaneStatusEnum,
  createdAt: z.string().or(z.date()),
});

export type CarrierLaneDTO = z.infer<typeof carrierLaneDTOSchema>;

// Availability Schemas
export const availabilityFormSchema = z
  .object({
    availableDays: AvailableDaysEnum,
    availableStartTime: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM format'),
    availableEndTime: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM format'),
    timeZone: z.string().min(1, 'Time zone is required'),
    currentlyOnLoad: z.boolean(),
  });

export type AvailabilityFormData = z.infer<typeof availabilityFormSchema>;

const availabilityDTOBase = availabilityFormSchema.extend({
  id: z.string(),
  lastUpdatedAt: z.string().or(z.date()),
});

export const carrierAvailabilityDTOSchema = availabilityDTOBase.refine(
  (data) => data.availableStartTime < data.availableEndTime,
  {
    message: 'Start time must be before end time',
    path: ['availableEndTime'],
  }
);

export type CarrierAvailabilityDTO = z.infer<typeof carrierAvailabilityDTOSchema>;

// Public Profile
export const publicCarrierProfileDTOSchema = z.object({
  truckerId: z.string(),
  equipment: z.array(carriEquipmentDTOSchema),
  lanes: z.array(carrierLaneDTOSchema),
  availability: carrierAvailabilityDTOSchema.nullable(),
});

export type PublicCarrierProfileDTO = z.infer<typeof publicCarrierProfileDTOSchema>;
