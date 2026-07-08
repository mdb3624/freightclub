import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useDieselPrices } from '@/features/market/hooks/useDieselPrices'
import { costProfileWizardSchema, type CostProfileWizardFormData } from '../../schemas/costProfile.schemas'

interface Props {
  initialData: Partial<CostProfileWizardFormData> | undefined
  onComplete: (data: CostProfileWizardFormData) => void
  onDataChange?: (data: Partial<CostProfileWizardFormData>) => void
}

const REGIONS = ['EAST', 'MIDWEST', 'SOUTH', 'ROCKY', 'WEST'] as const
const REGION_PRICE_FIELD = {
  EAST: 'eastPrice', MIDWEST: 'midwestPrice', SOUTH: 'southPrice', ROCKY: 'rockyPrice', WEST: 'westPrice',
} as const
const REGION_LABEL: Record<(typeof REGIONS)[number], string> = {
  EAST: 'East', MIDWEST: 'Midwest', SOUTH: 'South', ROCKY: 'Rocky', WEST: 'West',
}
const WEEK_OPTIONS = [44, 46, 48, 50, 52]
const inputStyle = { height: 52, fontSize: 16 }
const chipStyle = (active: boolean): React.CSSProperties => ({
  height: 56,
  padding: '8px 16px',
  borderRadius: 9999,
  border: active ? '1px solid #7A5F3A' : '1px solid #3A3A3A',
  background: active ? 'linear-gradient(180deg, #C9A46A 0%, #B08D57 45%, #8C6D3F 100%)' : 'transparent',
  color: active ? '#FFFFFF' : '#F5F5F5',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 2,
})
// Dark embossed 3D bevel for the "Back" buttons — distinct from the bright
// bronze primary CTA gradient, matching the Carrier persona's dark palette.
const backButtonStyle: React.CSSProperties = {
  height: 64,
  flex: 1,
  background: 'linear-gradient(180deg, #2A2A2A 0%, #1A1A1A 100%)',
  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.08), inset 0 -1px 2px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)',
  border: '1px solid #3A3A3A',
  color: '#C9A876',
}

const FIELD_LABELS: Record<keyof CostProfileWizardFormData, string> = {
  dieselRegion: 'Diesel region (Step 1)',
  milesPerGallon: 'MPG (Step 1)',
  additionalCostPerMile: 'Oil, tires, DEF cost (Step 1)',
  truckPaymentMonthly: 'Truck payment (Step 2)',
  insuranceMonthly: 'Insurance (Step 2)',
  permitsMonthly: 'Permits (Step 2)',
  annualMiles: 'Annual miles (Step 2)',
  weeklyIncomeGoal: 'Weekly take-home goal (Step 3)',
  weeksWorkedPerYear: 'Weeks worked per year (Step 3)',
}

// Fields where 0 is a genuinely valid answer (e.g. "$0 if paid off"). These
// default to 0 rather than staying undefined, since a user who reasonably
// leaves such a field untouched should not fail validation for it — only
// milesPerGallon/annualMiles/dieselRegion/weeksWorkedPerYear (which have no
// sensible zero default) remain required-until-touched.
const ZERO_VALID_DEFAULTS: Partial<CostProfileWizardFormData> = {
  additionalCostPerMile: 0,
  truckPaymentMonthly: 0,
  insuranceMonthly: 0,
  permitsMonthly: 0,
  weeklyIncomeGoal: 0,
}

// Step dots — 3 fill-in steps of this wizard (a 4th "result" step lives in the
// parent page's Summary view, not inside this component).
function StepDots({ step }: { step: number }) {
  return (
    <div data-testid="wizard-step-dots" style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center', padding: '0 0 12px' }}>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            width: i === step ? 20 : 7,
            height: 7,
            borderRadius: 9999,
            background: i === step ? '#B08D57' : i < step ? '#5A4A2A' : '#2A2A2A',
            transition: 'all 250ms',
          }}
        />
      ))}
    </div>
  )
}

// Diesel quick-reference strip — shown on the non-fuel steps as a reminder
// of the region price selected in Step 1.
function DieselQuickRef({ prices }: { prices: ReturnType<typeof useDieselPrices>['data'] }) {
  if (!prices) return null
  return (
    <div data-testid="diesel-quick-ref" style={{ display: 'flex', gap: 10, overflowX: 'auto', marginBottom: 12 }}>
      <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: '#636E72', flexShrink: 0, alignSelf: 'center' }}>
        Diesel
      </span>
      {REGIONS.map((region) => {
        const price = prices[REGION_PRICE_FIELD[region]]
        return (
          <span key={region} style={{ fontSize: 12, flexShrink: 0, color: '#636E72' }}>
            {REGION_LABEL[region]}{' '}
            <span style={{ color: '#F5F5F5', fontWeight: 700 }}>
              {price != null ? `$${price.toFixed(2)}` : '—'}
            </span>
          </span>
        )
      })}
    </div>
  )
}

export function CostProfileWizard({ initialData, onComplete, onDataChange }: Props) {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<Partial<CostProfileWizardFormData>>({ ...ZERO_VALID_DEFAULTS, ...initialData })
  const [validationError, setValidationError] = useState<string | null>(null)
  const { data: dieselPrices } = useDieselPrices()

  const set = <K extends keyof CostProfileWizardFormData>(key: K, value: CostProfileWizardFormData[K]) =>
    setData((d) => {
      const updated = { ...d, [key]: value }
      onDataChange?.(updated)
      return updated
    })

  // ZERO_VALID_DEFAULTS seeds these fields to 0 in state so validation
  // passes if left untouched — but the input's DOM defaultValue should stay
  // blank (showing the placeholder hint) until the user actually types a
  // value, rather than displaying a misleading literal "0".
  const displayValue = (key: keyof typeof ZERO_VALID_DEFAULTS) => data[key] || undefined

  return (
    <div data-testid="cost-profile-wizard" style={{ background: '#0a0a0a', color: '#F5F5F5', padding: 16 }}>
      <StepDots step={step} />
      {step !== 1 && <DieselQuickRef prices={dieselPrices} />}
      {step === 1 && (
        <div data-testid="wizard-step-1">
          <h2>Fuel</h2>
          <Input
            testId="mpg-input"
            label="MPG"
            type="number"
            style={inputStyle}
            defaultValue={data.milesPerGallon}
            onChange={(e) => set('milesPerGallon', Number(e.target.value))}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            {REGIONS.map((region) => {
              const price = dieselPrices?.[REGION_PRICE_FIELD[region]]
              return (
                <button
                  key={region}
                  type="button"
                  data-testid={`region-chip-${region}`}
                  style={chipStyle(data.dieselRegion === region)}
                  onClick={() => set('dieselRegion', region)}
                >
                  <span style={{ fontSize: 12 }}>{REGION_LABEL[region]}</span>
                  <span style={{ fontWeight: 900 }}>{price != null ? `$${price.toFixed(2)}` : '—'}</span>
                </button>
              )
            })}
          </div>
          <Input
            testId="additional-cost-input"
            label="Oil, tires, DEF ($/mi)"
            type="number"
            step="0.01"
            style={inputStyle}
            placeholder="Typically $0.06-$0.10/mi"
            defaultValue={displayValue('additionalCostPerMile')}
            onChange={(e) => set('additionalCostPerMile', Number(e.target.value))}
          />
          <Button
            persona="carrier"
            data-testid="wizard-next-btn"
            style={{ height: 64, width: '100%', marginTop: 16 }}
            onClick={() => setStep(2)}
          >
            Next — Fixed Costs →
          </Button>
        </div>
      )}

      {step === 2 && (
        <div data-testid="wizard-step-2">
          <h2>Fixed Costs</h2>
          <Input testId="truck-payment-input" label="Truck payment ($/mo)" type="number" style={inputStyle}
            placeholder="$0 if paid off" defaultValue={displayValue('truckPaymentMonthly')}
            onChange={(e) => set('truckPaymentMonthly', Number(e.target.value))} />
          <Input testId="insurance-input" label="Insurance ($/mo)" type="number" style={inputStyle}
            placeholder="$400-$900/mo for new authority" defaultValue={displayValue('insuranceMonthly')}
            onChange={(e) => set('insuranceMonthly', Number(e.target.value))} />
          <Input testId="permits-input" label="Permits ($/mo)" type="number" style={inputStyle}
            placeholder="IFTA, UCR, base plate ~$150" defaultValue={displayValue('permitsMonthly')}
            onChange={(e) => set('permitsMonthly', Number(e.target.value))} />
          <Input testId="annual-miles-input" label="Annual miles" type="number" style={inputStyle}
            placeholder="100,000-130,000 mi/year typical" defaultValue={data.annualMiles}
            onChange={(e) => set('annualMiles', Number(e.target.value))} />
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <Button variant="ghost" persona="carrier" data-testid="wizard-back-btn" style={backButtonStyle} onClick={() => setStep(1)}>
              Back
            </Button>
            <Button persona="carrier" data-testid="wizard-next-btn" style={{ height: 64, flex: 1 }} onClick={() => setStep(3)}>
              Next →
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div data-testid="wizard-step-3">
          <h2>Income Goal</h2>
          <Input testId="weekly-goal-input" label="Weekly take-home goal ($)" type="number" style={inputStyle}
            defaultValue={displayValue('weeklyIncomeGoal')}
            onChange={(e) => set('weeklyIncomeGoal', Number(e.target.value))} />
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            {WEEK_OPTIONS.map((weeks) => (
              <button
                key={weeks}
                type="button"
                data-testid={`weeks-chip-${weeks}`}
                style={chipStyle(data.weeksWorkedPerYear === weeks)}
                onClick={() => set('weeksWorkedPerYear', weeks)}
              >
                {weeks}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <Button variant="ghost" persona="carrier" data-testid="wizard-back-btn" style={backButtonStyle} onClick={() => setStep(2)}>
              Back
            </Button>
            <Button
              persona="carrier"
              data-testid="wizard-see-rpm-btn"
              style={{ height: 64, flex: 1 }}
              onClick={() => {
                const result = costProfileWizardSchema.safeParse(data)
                if (result.success) {
                  setValidationError(null)
                  onComplete(result.data)
                } else {
                  const missing = result.error.issues
                    .map((issue) => FIELD_LABELS[issue.path[0] as keyof CostProfileWizardFormData])
                    .filter(Boolean)
                  setValidationError(
                    missing.length > 0
                      ? `Please fill in: ${[...new Set(missing)].join(', ')}.`
                      : 'Please complete all fields before continuing.'
                  )
                }
              }}
            >
              See My RPM →
            </Button>
          </div>
          {validationError && (
            <p data-testid="wizard-validation-error" style={{ color: '#E74C3C', fontSize: 14, marginTop: 8 }}>
              {validationError}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
