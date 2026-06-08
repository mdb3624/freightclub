import type { UseFormRegister } from 'react-hook-form'
import { Input } from '@/components/ui/Input'
import { usePersonaTheme } from '@/contexts/PersonaThemeContext'
import type { UpdateProfileValues } from '@/features/profile/types'

interface Props {
  register: UseFormRegister<UpdateProfileValues>
  isTrucker: boolean
}

export function AddressSection({ register, isTrucker }: Props) {
  const { surfaceClassName, mutedClassName } = usePersonaTheme()

  return (
    <>
      <section className={`p-6 space-y-4 ${surfaceClassName}`}>
        <h3 className={`text-sm font-semibold uppercase tracking-wide ${mutedClassName}`}>Billing Address</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input data-testid="city-input" label="City" {...register('billingCity')} />
          <Input data-testid="state-input" label="State" {...register('billingState')} />
          <Input data-testid="zip-code-input" label="Zip Code" maxLength={10} {...register('billingZip')} />
        </div>
        <Input label="Street Address" placeholder="e.g. 123 Main St" {...register('billingAddress1')} />
        <Input label="Suite / Unit" placeholder="Suite, unit, building (optional)" {...register('billingAddress2')} />
      </section>

      {!isTrucker && (
        <section className={`p-6 space-y-4 ${surfaceClassName}`}>
          <h3 className={`text-sm font-semibold uppercase tracking-wide ${mutedClassName}`}>Default Pickup Location</h3>
          <p className={`text-xs ${mutedClassName}`}>Pre-fills the origin address when posting a new load.</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input label="City" {...register('defaultPickupCity')} />
            <Input label="State" {...register('defaultPickupState')} />
            <Input label="Zip Code" maxLength={10} {...register('defaultPickupZip')} />
          </div>
          <Input label="Street Address" placeholder="e.g. 456 Warehouse Dr" {...register('defaultPickupAddress1')} />
          <Input label="Suite / Unit" placeholder="Suite, unit, building (optional)" {...register('defaultPickupAddress2')} />
        </section>
      )}
    </>
  )
}
