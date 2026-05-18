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
  const truckPayment = Number(values.truckPaymentLease) || 0
  const insurance = Number(values.insurance) || 0
  const ifta = Number(values.iftaIrpPermits) || 0
  const phone = Number(values.phoneEldMisc) || 0
  const perDiem = (Number(values.perDiemDailyRate) || 0) * (Number(values.perDiemDaysPerMonth) || 0)
  const monthly = truckPayment + insurance + ifta + phone + perDiem
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

      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Fixed Monthly Costs</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Truck Payment / Lease ($)"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g. 1800"
              {...register('truckPaymentLease')}
            />
            <Input
              label="Insurance ($)"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g. 900"
              {...register('insurance')}
            />
            <Input
              label="IFTA / IRP / Permits ($)"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g. 200"
              {...register('iftaIrpPermits')}
            />
            <Input
              label="Phone / ELD / Misc ($)"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g. 150"
              {...register('phoneEldMisc')}
            />
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Variable Costs</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Diesel Price ($/Gal)"
              type="number"
              step="0.001"
              min="0"
              placeholder="e.g. 3.89"
              {...register('fuelCostPerGallon')}
            />
            <Input
              label="Fuel Efficiency (MPG)"
              type="number"
              step="0.1"
              min="0"
              placeholder="e.g. 6.5"
              {...register('milesPerGallon')}
            />
            <Input
              label="Maintenance Reserve ($/MI)"
              type="number"
              step="0.001"
              min="0"
              placeholder="e.g. 0.17"
              {...register('maintenanceCostPerMile')}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Per Diem ($/Day)"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 800"
                {...register('perDiemDailyRate')}
              />
              <Input
                label="Days/Month"
                type="number"
                step="1"
                min="0"
                max="31"
                placeholder="e.g. 20"
                {...register('perDiemDaysPerMonth')}
              />
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Operational</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Miles Driven (Monthly)"
              type="number"
              min="1"
              placeholder="e.g. 8000"
              {...register('monthlyMilesTarget')}
            />
            <Input
              label="Target Profit Margin ($/MI)"
              type="number"
              step="0.001"
              min="0"
              placeholder="e.g. 0.60"
              {...register('targetMarginPerMile')}
            />
          </div>
        </div>
      </div>

      <CostProfileSummary control={control} />
    </section>
  )
}
