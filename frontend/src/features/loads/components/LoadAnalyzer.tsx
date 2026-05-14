import { useRef, useState } from 'react'
import { COST_DEFAULTS } from '@/lib/constants'
import type { DieselPrices } from '@/features/market/types'

export interface LogEntry {
  origin: string
  dest: string
  equip: string
  miles: number
  rate: number
  rpm: string
  profit: string
  verdict: 'go' | 'warn' | 'nogo'
  date: string
}

interface LaResult {
  origin: string
  dest: string
  rpm: number
  profit: number
  effectiveRPM: number
  totalMiles: number
  dh: number
  loadedMiles: number
  totalRevenue: number
  fuelCost: number
  maintCost: number
  perDiemCost: number
  fixedOverhead: number
  profitMargin: number
  minRPM: number
  gallons: number
  fuelCPM: number
  verdict: 'go' | 'warn' | 'nogo'
  verdictText: string
  marketNote: string
  rate: number
  fsc: number
  access: number
  days: number
}

interface Props {
  dieselData: DieselPrices | undefined
  onAddLogEntry: (entry: LogEntry) => void
}

export function LoadAnalyzer({ dieselData, onAddLogEntry }: Props) {
  const laOrigin = useRef<HTMLInputElement>(null)
  const laDest = useRef<HTMLInputElement>(null)
  const laMiles = useRef<HTMLInputElement>(null)
  const laDh = useRef<HTMLInputElement>(null)
  const laRate = useRef<HTMLInputElement>(null)
  const laEquip = useRef<HTMLSelectElement>(null)
  const laCpm = useRef<HTMLInputElement>(null)
  const laFsc = useRef<HTMLInputElement>(null)
  const laAccess = useRef<HTMLInputElement>(null)
  const laDays = useRef<HTMLInputElement>(null)
  const laMarket = useRef<HTMLInputElement>(null)
  const [laResult, setLaResult] = useState<LaResult | null>(null)

  function analyzeLoad() {
    const origin = laOrigin.current?.value || '—'
    const dest = laDest.current?.value || '—'
    const miles = parseFloat(laMiles.current?.value || '') || 0
    const dh = parseFloat(laDh.current?.value || '') || 0
    const rate = parseFloat(laRate.current?.value || '') || 0
    const cpm = parseFloat(laCpm.current?.value || '') || 1.50
    const fsc = parseFloat(laFsc.current?.value || '') || 0
    const access = parseFloat(laAccess.current?.value || '') || 0
    const days = parseFloat(laDays.current?.value || '') || 1
    const market = parseFloat(laMarket.current?.value || '') || 0
    const equip = laEquip.current?.value || 'dryvan'

    if (!miles || !rate) { window.alert('Please enter at least loaded miles and offered rate.'); return }

    const totalRevenue = rate + fsc + access
    const totalMiles = miles + dh
    const dieselPrice = dieselData?.available && dieselData.westPrice != null ? dieselData.westPrice : COST_DEFAULTS.dieselPrice
    const fuelCPM = dieselPrice / 6.5
    const fuelCost = totalMiles * fuelCPM
    const maintCost = totalMiles * COST_DEFAULTS.maintCpm
    const perDiemCost = days * 40
    const totalVarCost = fuelCost + maintCost + perDiemCost
    const totalCost = cpm * totalMiles
    const fixedOverhead = totalCost - totalVarCost
    const profit = totalRevenue - totalCost
    const rpm = rate / miles
    const effectiveRPM = totalRevenue / totalMiles
    const minRPM = cpm + 0.50
    const profitMargin = (profit / totalRevenue) * 100
    const gallons = totalMiles / 6.5

    let verdict: 'go' | 'warn' | 'nogo'
    let verdictText: string
    if (rpm >= minRPM && profitMargin > 15) {
      verdict = 'go'; verdictText = '✅ GO — Load is Profitable'
    } else if (rpm >= cpm && profitMargin > 0) {
      verdict = 'warn'; verdictText = '⚠️ CAUTION — Marginal Profitability'
    } else {
      verdict = 'nogo'; verdictText = '🚫 NO-GO — Load is Unprofitable'
    }

    let marketNote = ''
    if (market > 0) {
      if (rpm < market * 0.9)
        marketNote = `⚠️ Market paying ~$${market.toFixed(2)}/mi — consider countering at $${(market * miles).toFixed(0)}`
      else
        marketNote = `✓ Offer is within market range ($${market.toFixed(2)}/mi)`
    }

    setLaResult({ origin, dest, rpm, profit, effectiveRPM, totalMiles, dh, loadedMiles: miles, totalRevenue, fuelCost, maintCost, perDiemCost, fixedOverhead, profitMargin, minRPM, gallons, fuelCPM, verdict, verdictText, marketNote, rate, fsc, access, days })

    onAddLogEntry({
      origin, dest, equip: equip.toUpperCase(), miles: totalMiles,
      rate: totalRevenue, rpm: rpm.toFixed(2), profit: profit.toFixed(0),
      verdict, date: new Date().toLocaleDateString(),
    })
  }

  return (
    <div className="animate-in">
      <div className="section-title">Load Profitability Analyzer</div>
      <div className="section-sub">Enter load details to get full RPM analysis, deadhead cost, and GO / NO-GO verdict</div>

      <div className="grid-2 mb-16">
        {/* INPUT FORM */}
        <div className="card">
          <div className="card-title">Load Details</div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Origin City, State</label>
              <input ref={laOrigin} className="form-input" placeholder="e.g. Chicago, IL" />
            </div>
            <div className="form-group">
              <label className="form-label">Destination City, State</label>
              <input ref={laDest} className="form-input" placeholder="e.g. Dallas, TX" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Loaded Miles</label>
              <input ref={laMiles} className="form-input" type="number" placeholder="e.g. 920"
                onChange={() => {
                  const miles = parseFloat(laMiles.current?.value || '') || 0
                  const price = dieselData?.available && dieselData.westPrice != null ? dieselData.westPrice : COST_DEFAULTS.dieselPrice
                  if (miles > 0 && laFsc.current) {
                    laFsc.current.value = Math.round(miles / 6.5 * price).toString()
                  }
                }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Deadhead (DH) Miles</label>
              <input ref={laDh} className="form-input" type="number" placeholder="e.g. 45" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Broker Offered Rate ($)</label>
              <input ref={laRate} className="form-input" type="number" placeholder="e.g. 2100" />
            </div>
            <div className="form-group">
              <label className="form-label">Equipment Type</label>
              <select ref={laEquip} className="form-select">
                <option value="dryvan">Dry Van</option>
                <option value="reefer">Reefer</option>
                <option value="flatbed">Flatbed</option>
                <option value="stepdeck">Step Deck</option>
              </select>
            </div>
          </div>
          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">Your CPM ($)</label>
              <input ref={laCpm} className="form-input" type="number" step="0.01" placeholder="e.g. 1.50" />
            </div>
            <div className="form-group">
              <label className="form-label">Fuel Surcharge ($)</label>
              <input ref={laFsc} className="form-input" type="number" placeholder="e.g. 150" defaultValue="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Accessorials ($)</label>
              <input ref={laAccess} className="form-input" type="number" placeholder="e.g. 75" defaultValue="0" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Estimated Transit Days</label>
              <input ref={laDays} className="form-input" type="number" placeholder="e.g. 2" defaultValue="1" />
            </div>
            <div className="form-group">
              <label className="form-label">Market RPM for Lane ($)</label>
              <input ref={laMarket} className="form-input" type="number" step="0.01" placeholder="e.g. 2.30" />
            </div>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} onClick={analyzeLoad}>
            ANALYZE LOAD →
          </button>
        </div>

        {/* RESULTS */}
        {laResult ? (
          <div>
            <div className="grid-2 mb-16">
              <div className="stat-card stat-accent">
                <div className="stat-label">Offered RPM</div>
                <div className="stat-value text-accent" style={{ fontSize: 28 }}>${laResult.rpm.toFixed(2)}</div>
                <div className="stat-sub">Min floor: ${laResult.minRPM.toFixed(2)}/mi</div>
              </div>
              <div className={`stat-card ${laResult.profit >= 0 ? 'stat-green' : 'stat-red'}`}>
                <div className="stat-label">Net Profit</div>
                <div className={`stat-value ${laResult.profit >= 0 ? 'text-green' : 'text-red'}`} style={{ fontSize: 28 }}>${laResult.profit.toFixed(0)}</div>
                <div className="stat-sub">{laResult.profitMargin.toFixed(1)}% margin</div>
              </div>
              <div className="stat-card stat-blue">
                <div className="stat-label">Effective RPM</div>
                <div className="stat-value text-blue" style={{ fontSize: 28 }}>${laResult.effectiveRPM.toFixed(2)}</div>
                <div className="stat-sub">Incl. DH + all revenue</div>
              </div>
              <div className="stat-card stat-accent">
                <div className="stat-label">Total Miles</div>
                <div className="stat-value text-accent" style={{ fontSize: 28 }}>{laResult.totalMiles.toLocaleString()}</div>
                <div className="stat-sub">{laResult.dh} mi DH + {laResult.loadedMiles} mi loaded</div>
              </div>
            </div>
            <div className="card">
              <div className="card-title">Cost Breakdown</div>
              <table className="breakdown">
                <tbody>
                  <tr><td>Base Rate</td><td>${laResult.rate.toLocaleString()}</td></tr>
                  <tr><td>Fuel Surcharge</td><td>${laResult.fsc}</td></tr>
                  <tr><td>Accessorials</td><td>${laResult.access}</td></tr>
                  <tr><td style={{ color: 'var(--muted)' }}>— Fuel Cost ({laResult.totalMiles} mi)</td><td style={{ color: 'var(--red)' }}>-${laResult.fuelCost.toFixed(0)}</td></tr>
                  <tr><td style={{ color: 'var(--muted)' }}>— Maintenance Reserve</td><td style={{ color: 'var(--red)' }}>-${laResult.maintCost.toFixed(0)}</td></tr>
                  <tr><td style={{ color: 'var(--muted)' }}>— Per Diem ({laResult.days} day{laResult.days > 1 ? 's' : ''})</td><td style={{ color: 'var(--red)' }}>-${laResult.perDiemCost.toFixed(0)}</td></tr>
                  <tr><td style={{ color: 'var(--muted)' }}>— Fixed Overhead (CPM)</td><td style={{ color: 'var(--red)' }}>-${laResult.fixedOverhead.toFixed(0)}</td></tr>
                  <tr className="total-row"><td>NET PROFIT</td><td>${laResult.profit.toFixed(2)}</td></tr>
                </tbody>
              </table>
              {laResult.marketNote && (
                <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(255,224,0,0.08)', border: '1px solid rgba(255,224,0,0.2)', borderRadius: 3, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--yellow)' }}>
                  {laResult.marketNote}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: 'var(--muted)', minHeight: 260 }}>
            <div style={{ fontSize: 48 }}>🚛</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, letterSpacing: 3, textTransform: 'uppercase' }}>Enter load details to begin analysis</div>
          </div>
        )}
      </div>

      {/* VERDICT */}
      {laResult && (
        <div className={`verdict ${laResult.verdict}`}>
          <div>
            <div>{laResult.verdictText}</div>
            <div className="verdict-details">{laResult.origin} → {laResult.dest} &nbsp;|&nbsp; ${laResult.rpm.toFixed(2)} RPM &nbsp;|&nbsp; ${laResult.profit.toFixed(0)} net &nbsp;|&nbsp; {laResult.totalMiles} total miles</div>
          </div>
        </div>
      )}

      {/* FUEL BREAKDOWN */}
      {laResult && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-title">Fuel Cost Breakdown</div>
          <div className="grid-3">
            <div>
              <div className="stat-label">Estimated Gallons</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--accent2)' }}>{laResult.gallons.toFixed(0)} gal</div>
            </div>
            <div>
              <div className="stat-label">Fuel Cost (@ ${COST_DEFAULTS.dieselPrice}/gal)</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--red)' }}>${laResult.fuelCost.toFixed(0)}</div>
            </div>
            <div>
              <div className="stat-label">Fuel CPM</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--accent)' }}>${laResult.fuelCPM.toFixed(3)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
