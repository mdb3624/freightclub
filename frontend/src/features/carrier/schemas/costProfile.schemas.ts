import { z } from 'zod'

export const DieselRegionEnum = z.enum(['EAST', 'MIDWEST', 'SOUTH', 'ROCKY', 'WEST'])
export const WeeksWorkedEnum = z.enum(['44', '46', '48', '50', '52'])

export const costProfileWizardSchema = z.object({
  dieselRegion: DieselRegionEnum,
  milesPerGallon: z.number().min(1, 'MPG must be positive'),
  additionalCostPerMile: z.number().min(0, 'Must be 0 or more'),
  truckPaymentMonthly: z.number().min(0, 'Must be 0 or more'),
  insuranceMonthly: z.number().min(0, 'Must be 0 or more'),
  permitsMonthly: z.number().min(0, 'Must be 0 or more'),
  annualMiles: z.number().min(1, 'Annual miles must be positive'),
  weeklyIncomeGoal: z.number().min(0, 'Must be 0 or more'),
  weeksWorkedPerYear: z.number().min(1).max(52),
})

export type CostProfileWizardFormData = z.infer<typeof costProfileWizardSchema>

export interface CostProfileResponseDTO extends CostProfileWizardFormData {
  fuelCpm: number
  variableCpm: number
  fixedCpm: number
  marginCpm: number
  breakevenRpm: number
  minRpm: number
  targetRpm: number
}
