import type { UseFormRegister, FieldErrors } from 'react-hook-form'
import { Input } from '@/components/ui/Input'
import type { UpdateProfileValues } from '@/features/profile/types'

const EQUIPMENT_OPTIONS = [
  { value: 'DRY_VAN',   label: 'Dry Van' },
  { value: 'FLATBED',   label: 'Flatbed' },
  { value: 'REEFER',    label: 'Reefer' },
  { value: 'STEP_DECK', label: 'Step Deck' },
] as const

interface Props {
  register: UseFormRegister<UpdateProfileValues>
  errors: FieldErrors<UpdateProfileValues>
  isTrucker: boolean
}

export function PersonalInfoSection({ register, errors, isTrucker }: Props) {
  return (
    <>
      <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Personal Information</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="First Name" error={errors.firstName?.message} {...register('firstName')} />
          <Input label="Last Name" error={errors.lastName?.message} {...register('lastName')} />
        </div>
        <Input label="Business Name" placeholder="Optional" {...register('businessName')} />
        <Input label="Phone" type="tel" placeholder="e.g. 555-123-4567" maxLength={20} {...register('phone')} />
      </section>

      {isTrucker && (
        <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Carrier Information</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="MC Number"
              placeholder="e.g. MC-123456"
              maxLength={20}
              error={errors.mcNumber?.message}
              {...register('mcNumber')}
            />
            <Input
              label="DOT Number"
              placeholder="e.g. 1234567"
              maxLength={20}
              error={errors.dotNumber?.message}
              {...register('dotNumber')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Equipment</label>
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              {...register('equipmentType')}
            >
              <option value="">Select equipment type</option>
              {EQUIPMENT_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </section>
      )}
    </>
  )
}
