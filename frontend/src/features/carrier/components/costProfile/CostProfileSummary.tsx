import { Button } from '@/components/ui/Button'
import type { CostProfileResponseDTO } from '../../schemas/costProfile.schemas'

interface Props {
  profile: CostProfileResponseDTO
  onEdit: () => void
}

const fmt = (n: number) => `$${n.toFixed(2)}`

export function CostProfileSummary({ profile, onEdit }: Props) {
  return (
    <div data-testid="cost-profile-summary" style={{ background: '#0a0a0a', color: '#F5F5F5', padding: 16 }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <div
          data-testid="kpi-breakeven-tile"
          style={{ flex: 1, background: '#121212', border: '1px solid #2A2A2A', borderRadius: 8, padding: 16, textAlign: 'center' }}
        >
          <p style={{ fontSize: 12, textTransform: 'uppercase', color: '#808080' }}>Break-even</p>
          <p data-testid="kpi-breakeven-value" style={{ fontSize: 24, fontWeight: 700, color: '#EF4444' }}>
            {fmt(profile.breakevenRpm)}
          </p>
          <p style={{ fontSize: 12, color: '#636E72' }}>Stay home</p>
        </div>
        <div
          data-testid="kpi-min-rpm-tile"
          style={{ flex: 1, background: '#121212', border: '1px solid #2A2A2A', borderRadius: 8, padding: 16, textAlign: 'center' }}
        >
          <p style={{ fontSize: 12, textTransform: 'uppercase', color: '#808080' }}>Min RPM</p>
          <p data-testid="kpi-min-rpm-value" style={{ fontSize: 24, fontWeight: 700, color: '#F59E0B' }}>
            {fmt(profile.minRpm)}
          </p>
          <p style={{ fontSize: 12, color: '#636E72' }}>Bare min</p>
        </div>
        <div
          data-testid="kpi-target-tile"
          style={{ flex: 1, background: '#121212', border: '1px solid #2A2A2A', borderRadius: 8, padding: 16, textAlign: 'center' }}
        >
          <p style={{ fontSize: 12, textTransform: 'uppercase', color: '#808080' }}>Target</p>
          <p data-testid="kpi-target-value" style={{ fontSize: 24, fontWeight: 700, color: '#22C55E' }}>
            {fmt(profile.targetRpm)}
          </p>
          <p style={{ fontSize: 12, color: '#636E72' }}>Run it</p>
        </div>
      </div>

      <div style={{ marginTop: 16, fontSize: 14 }}>
        <p>Fuel: <span style={{ fontFamily: 'monospace' }}>${profile.fuelCpm.toFixed(3)}/mi</span> → {profile.milesPerGallon} MPG · {profile.dieselRegion} diesel</p>
        <p>Fixed: <span style={{ fontFamily: 'monospace' }}>${profile.fixedCpm.toFixed(3)}/mi</span> → ${(profile.truckPaymentMonthly + profile.insuranceMonthly + profile.permitsMonthly).toLocaleString()}/mo ÷ {profile.annualMiles.toLocaleString()} mi</p>
        <p>Margin: <span style={{ fontFamily: 'monospace' }}>${profile.marginCpm.toFixed(3)}/mi</span> → ${profile.weeklyIncomeGoal.toLocaleString()}/wk × {profile.weeksWorkedPerYear} wks</p>
      </div>

      <Button
        persona="carrier"
        data-testid="update-cost-profile-btn"
        onClick={onEdit}
        style={{ marginTop: 16, height: 64, width: '100%' }}
      >
        Update Cost Profile
      </Button>
    </div>
  )
}
