import type { UseFormRegister, Control } from 'react-hook-form'
import { useWatch } from 'react-hook-form'
import { Input } from '@/components/ui/Input'
import type { UpdateProfileValues } from '@/features/profile/types'

interface Props {
  register: UseFormRegister<UpdateProfileValues>
  control: Control<UpdateProfileValues>
}

function CostProfileSummary({ control }: { control: Control<UpdateProfileValues> }) {
  const values = useWatch({ control })
  const monthly = Number(values.monthlyFixedCosts) || 0
  const milesTarget = Number(values.monthlyMilesTarget) || 0
  const fuelPerGallon = Number(values.fuelCostPerGallon) || 0
  const mpg = Number(values.milesPerGallon) || 0
  const maintPerMile = Number(values.maintenanceCostPerMile) || 0
  const marginPerMile = Number(values.targetMarginPerMile) || 0

  if (milesTarget <= 0) return null

  const fixedCpm = monthly / milesTarget
  const fuelCpm = mpg > 0 ? fuelPerGallon / mpg : 0
  const variableCpm = fuelCpm + maintPerMile
  const totalCpm = fixedCpm + variableCpm
  const minRpm = totalCpm + marginPerMile

  return (
    <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Calculated Cost Breakdown
      </p>
      <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
        <span className="text-gray-600">Fixed CPM</span>
        <span className="font-mono text-gray-900">${fixedCpm.toFixed(4)}/mi</span>
        <span className="text-gray-600">Variable CPM (fuel + maint.)</span>
        <span className="font-mono text-gray-900">${variableCpm.toFixed(4)}/mi</span>
        <span className="text-gray-700 font-semibold">Total CPM</span>
        <span className="font-mono font-semibold text-gray-900">${totalCpm.toFixed(4)}/mi</span>
        <span className="text-primary-700 font-semibold">Minimum RPM</span>
        <span className="font-mono font-semibold text-primary-700">${minRpm.toFixed(4)}/mi</span>
      </div>
    </div>
  )
}

export function CostProfileSection({ register, control }: Props) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Cost Profile</h3>
        <p className="text-xs text-gray-500 mt-1">
          Used to calculate load profitability and your minimum RPM. All fields optional.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Monthly Fixed Costs ($)"
          type="number"
          step="0.01"
          min="0"
          placeholder="e.g. 3500 (truck payment + insurance + permits)"
          {...register('monthlyFixedCosts')}
        />
        <Input
          label="Monthly Miles Target"
          type="number"
          min="1"
          placeholder="e.g. 10000"
          {...register('monthlyMilesTarget')}
        />
        <Input
          label="Fuel Cost per Gallon ($)"
          type="number"
          step="0.001"
          min="0"
          placeholder="e.g. 3.799"
          {...register('fuelCostPerGallon')}
        />
        <Input
          label="Miles per Gallon (MPG)"
          type="number"
          step="0.1"
          min="0"
          placeholder="e.g. 6.5"
          {...register('milesPerGallon')}
        />
        <Input
          label="Maintenance Cost per Mile ($)"
          type="number"
          step="0.001"
          min="0"
          placeholder="e.g. 0.15"
          {...register('maintenanceCostPerMile')}
        />
        <Input
          label="Target Profit Margin per Mile ($)"
          type="number"
          step="0.001"
          min="0"
          placeholder="e.g. 0.50"
          {...register('targetMarginPerMile')}
        />
      </div>
      <CostProfileSummary control={control} />
    </section>
  )
}
