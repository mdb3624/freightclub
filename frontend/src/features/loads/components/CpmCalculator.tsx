import { useEffect, useState } from 'react'
import { COST_DEFAULTS } from '@/lib/constants'
import type { DieselPrices } from '@/features/market/types'

interface CpmResult {
  cpm: number
  minRPM: number
  fuelCPM: number
  maint: number
  fixedTotal: number
  fuelMonthly: number
  maintMonthly: number
  totalExpenses: number
  miles: number
  perdiem: number
  truck: number
  ins: number
  permits: number
  misc: number
}

interface Props {
  dieselData: DieselPrices | undefined
}

function getCpmRingColor(cpmResult: CpmResult | null): string {
  if (!cpmResult) return 'var(--accent)'
  if (cpmResult.cpm < 1.50) return 'var(--green)'
  if (cpmResult.cpm < 2.20) return 'var(--yellow)'
  return 'var(--red)'
}

export function CpmCalculator({ dieselData }: Props) {
  const [cpmForm, setCpmForm] = useState({
    truck: '', ins: '', permits: '', misc: '',
    diesel: String(COST_DEFAULTS.dieselPrice), mpg: '6.5',
    maint: String(COST_DEFAULTS.maintCpm), perdiem: '', miles: '', margin: '0.60',
  })
  const [cpmResult, setCpmResult] = useState<CpmResult | null>(null)

  useEffect(() => {
    const miles = parseFloat(cpmForm.miles) || 0
    if (!miles) { setCpmResult(null); return }
    const truck = parseFloat(cpmForm.truck) || 0
    const ins = parseFloat(cpmForm.ins) || 0
    const permits = parseFloat(cpmForm.permits) || 0
    const misc = parseFloat(cpmForm.misc) || 0
    const diesel = parseFloat(cpmForm.diesel) || COST_DEFAULTS.dieselPrice
    const mpg = parseFloat(cpmForm.mpg) || 6.5
    const maint = parseFloat(cpmForm.maint) || COST_DEFAULTS.maintCpm
    const perdiem = parseFloat(cpmForm.perdiem) || 0
    const margin = parseFloat(cpmForm.margin) || 0.60
    const fixedTotal = truck + ins + permits + misc
    const fuelCPM = diesel / mpg
    const fuelMonthly = fuelCPM * miles
    const maintMonthly = maint * miles
    const totalExpenses = fixedTotal + fuelMonthly + maintMonthly + perdiem
    const cpm = totalExpenses / miles
    const minRPM = cpm + margin
    setCpmResult({ cpm, minRPM, fuelCPM, maint, fixedTotal, fuelMonthly, maintMonthly, totalExpenses, miles, perdiem, truck, ins, permits, misc })
  }, [cpmForm])

  useEffect(() => {
    if (dieselData?.available && dieselData.westPrice != null) {
      setCpmForm(f => ({ ...f, diesel: dieselData.westPrice!.toFixed(2) }))
    }
  }, [dieselData])

  const cpmRingColor = getCpmRingColor(cpmResult)
  const cpmRingOffset = cpmResult ? 2 * Math.PI * 68 * (1 - Math.min(cpmResult.cpm / 3.50, 1)) : 2 * Math.PI * 68

  return (
    <div className="animate-in">
      <div className="section-title">Cost Per Mile Calculator</div>
      <div className="section-sub">Calculate your monthly break-even CPM and set your minimum acceptable RPM</div>

      <div className="grid-2 mb-16">
        <div className="card">
          <div className="card-title">Fixed Monthly Costs</div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Truck Payment / Lease ($)</label>
              <input className="form-input" type="number" value={cpmForm.truck} placeholder="e.g. 1800" onChange={e => setCpmForm(f => ({ ...f, truck: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Insurance ($)</label>
              <input className="form-input" type="number" value={cpmForm.ins} placeholder="e.g. 900" onChange={e => setCpmForm(f => ({ ...f, ins: e.target.value }))} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">IFTA / IRP / Permits ($)</label>
              <input className="form-input" type="number" value={cpmForm.permits} placeholder="e.g. 200" onChange={e => setCpmForm(f => ({ ...f, permits: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone / ELD / Misc ($)</label>
              <input className="form-input" type="number" value={cpmForm.misc} placeholder="e.g. 150" onChange={e => setCpmForm(f => ({ ...f, misc: e.target.value }))} />
            </div>
          </div>
          <hr className="divider" />
          <div className="card-title">Variable Costs</div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Diesel Price ($/gal)</label>
              <input className="form-input" type="number" step="0.01" value={cpmForm.diesel} onChange={e => setCpmForm(f => ({ ...f, diesel: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Fuel Efficiency (MPG)</label>
              <input className="form-input" type="number" step="0.1" value={cpmForm.mpg} onChange={e => setCpmForm(f => ({ ...f, mpg: e.target.value }))} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Maintenance Reserve ($/mi)</label>
              <input className="form-input" type="number" step="0.01" value={cpmForm.maint} onChange={e => setCpmForm(f => ({ ...f, maint: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Per Diem ($/day × days)</label>
              <input className="form-input" type="number" value={cpmForm.perdiem} placeholder="e.g. 800" onChange={e => setCpmForm(f => ({ ...f, perdiem: e.target.value }))} />
            </div>
          </div>
          <hr className="divider" />
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Miles Driven (Monthly)</label>
              <input className="form-input" type="number" value={cpmForm.miles} placeholder="e.g. 8000" onChange={e => setCpmForm(f => ({ ...f, miles: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Target Profit Margin ($/mi)</label>
              <input className="form-input" type="number" step="0.01" value={cpmForm.margin} onChange={e => setCpmForm(f => ({ ...f, margin: e.target.value }))} />
            </div>
          </div>
        </div>

        <div>
          <div className="card mb-16" style={{ textAlign: 'center', padding: 32 }}>
            <div className="card-title" style={{ textAlign: 'left' }}>Break-Even CPM</div>
            <div className="ring-wrap">
              <svg width="160" height="160" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="68" fill="none" stroke="var(--surface)" strokeWidth="10" />
                <circle cx="80" cy="80" r="68" fill="none" stroke={cpmRingColor} strokeWidth="10"
                  strokeDasharray="427" strokeDashoffset={cpmRingOffset} strokeLinecap="round"
                  transform="rotate(-90 80 80)" style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
              </svg>
              <div className="ring-center">
                <div className="ring-value" style={{ color: cpmRingColor }}>{cpmResult ? '$' + cpmResult.cpm.toFixed(2) : '—'}</div>
                <div className="ring-unit">/MILE</div>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>MINIMUM RPM (NO-GO FLOOR)</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 28, color: 'var(--accent2)' }}>
                {cpmResult ? '$' + cpmResult.minRPM.toFixed(2) : '—'}
              </div>
            </div>
          </div>

          <div className="grid-2 mb-16">
            <div className="stat-card stat-accent">
              <div className="stat-label">Fuel CPM</div>
              <div className="stat-value text-accent" style={{ fontSize: 24 }}>{cpmResult ? '$' + cpmResult.fuelCPM.toFixed(3) : '—'}</div>
            </div>
            <div className="stat-card stat-green">
              <div className="stat-label">Maintenance CPM</div>
              <div className="stat-value text-green" style={{ fontSize: 24 }}>{cpmResult ? '$' + cpmResult.maint.toFixed(3) : '—'}</div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Monthly Cost Breakdown</div>
            {cpmResult ? (
              <table className="breakdown">
                <tbody>
                  <tr><td style={{ color: 'var(--muted)' }}>Truck/Lease</td><td>${cpmResult.truck.toLocaleString()}</td></tr>
                  <tr><td style={{ color: 'var(--muted)' }}>Insurance</td><td>${cpmResult.ins.toLocaleString()}</td></tr>
                  <tr><td style={{ color: 'var(--muted)' }}>Permits/IFTA/IRP</td><td>${cpmResult.permits.toLocaleString()}</td></tr>
                  <tr><td style={{ color: 'var(--muted)' }}>ELD/Phone/Misc</td><td>${cpmResult.misc.toLocaleString()}</td></tr>
                  <tr><td style={{ color: 'var(--muted)' }}>Fuel ({cpmResult.miles.toLocaleString()} mi × ${cpmResult.fuelCPM.toFixed(3)})</td><td>${cpmResult.fuelMonthly.toFixed(0)}</td></tr>
                  <tr><td style={{ color: 'var(--muted)' }}>Maintenance Reserve</td><td>${cpmResult.maintMonthly.toFixed(0)}</td></tr>
                  <tr><td style={{ color: 'var(--muted)' }}>Per Diem</td><td>${cpmResult.perdiem}</td></tr>
                  <tr className="total-row"><td>TOTAL MONTHLY COST</td><td>${cpmResult.totalExpenses.toFixed(0)}</td></tr>
                </tbody>
              </table>
            ) : (
              <div style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>Fill in expenses above to see breakdown</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
