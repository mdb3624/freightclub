import { useEffect, useState, useMemo } from 'react'
import { useDieselPrices } from '@/features/market/hooks/useDieselPrices'
import { LoadAnalyzer } from '@/features/loads/components/LoadAnalyzer'
import { CpmCalculator } from '@/features/loads/components/CpmCalculator'
import { CommunicationBuilder } from '@/features/loads/components/CommunicationBuilder'
import type { LogEntry } from '@/features/loads/components/LoadAnalyzer'
import type { DieselPrices } from '@/features/market/types'

interface TickerItem {
  label: string
  value: string
  delta?: string
  deltaUp?: boolean
  stale?: boolean
  period?: string
}

const STATIC_TICKER_ITEMS: TickerItem[] = [
  { label: 'DIESEL NATL AVG', value: '$3.89/gal' },
  { label: 'DRY VAN SPOT', value: '$2.14 RPM' },
  { label: 'REEFER SPOT', value: '$2.76 RPM' },
  { label: 'FLATBED SPOT', value: '$2.38 RPM' },
  { label: 'LOAD-TO-TRUCK RATIO', value: '3.2:1' },
  { label: 'CA→TX CORRIDOR', value: 'HIGH VOLUME' },
  { label: 'MIDWEST REEFER', value: 'SEASONAL +12%' },
  { label: 'FMCSA HOS', value: '11HR DRIVE / 14HR DUTY' },
  { label: 'DATA', value: 'U.S. EIA' },
]

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;900&family=IBM+Plex+Mono:wght@400;500&family=Barlow:wght@300;400;500&display=swap');

body.hauler-active {
  background: #0a0c10;
  color: #e8edf5;
  font-family: 'Barlow', sans-serif;
  min-height: 100vh;
  overflow-x: hidden;
  margin: 0;
}
body.hauler-active::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
  z-index: 0;
}

#hauler-root {
  --black: #0a0c10;
  --surface: #111520;
  --card: #161c2d;
  --border: #1f2d4a;
  --accent: #f5a623;
  --accent2: #00d4ff;
  --red: #ff3b3b;
  --green: #00e676;
  --yellow: #ffe000;
  --text: #e8edf5;
  --muted: #6b7a99;
  --font-display: 'Barlow Condensed', sans-serif;
  --font-body: 'Barlow', sans-serif;
  --font-mono: 'IBM Plex Mono', monospace;
}

#hauler-root * { box-sizing: border-box; margin: 0; padding: 0; }

#hauler-root header {
  position: sticky; top: 0; z-index: 100;
  background: rgba(10,12,16,0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  padding: 0 32px;
  display: flex; align-items: center; justify-content: space-between;
  height: 60px;
}
#hauler-root .logo {
  font-family: var(--font-display); font-weight: 900;
  font-size: 28px; letter-spacing: 4px; color: var(--accent); text-transform: uppercase;
}
#hauler-root .logo span { color: var(--accent2); }
#hauler-root .header-meta {
  font-family: var(--font-mono); font-size: 11px; color: var(--muted); text-align: right; line-height: 1.6;
}
#hauler-root .live-dot {
  display: inline-block; width: 7px; height: 7px; border-radius: 50%;
  background: var(--green); margin-right: 5px; animation: h-pulse 2s infinite;
}
@keyframes h-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

#hauler-root .nav-tabs {
  display: flex; gap: 2px; background: var(--surface);
  border-bottom: 1px solid var(--border); padding: 0 32px;
  position: relative; z-index: 10;
}
#hauler-root .nav-tab {
  padding: 14px 22px; font-family: var(--font-display); font-weight: 700;
  font-size: 13px; letter-spacing: 2px; text-transform: uppercase;
  color: var(--muted); cursor: pointer; border-bottom: 3px solid transparent;
  transition: all 0.2s; white-space: nowrap;
}
#hauler-root .nav-tab:hover { color: var(--text); }
#hauler-root .nav-tab.active { color: var(--accent); border-bottom-color: var(--accent); }

#hauler-root .main {
  position: relative; z-index: 1; padding: 28px 32px;
  max-width: 1400px; margin: 0 auto;
}

#hauler-root .card {
  background: var(--card); border: 1px solid var(--border);
  border-radius: 4px; padding: 24px; position: relative; overflow: hidden;
}
#hauler-root .card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, var(--accent), transparent);
}
#hauler-root .card-title {
  font-family: var(--font-display); font-weight: 700; font-size: 11px;
  letter-spacing: 3px; text-transform: uppercase; color: var(--muted); margin-bottom: 20px;
}

#hauler-root .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
#hauler-root .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
#hauler-root .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
#hauler-root .mb-16 { margin-bottom: 16px; }

#hauler-root .form-group { margin-bottom: 16px; }
#hauler-root .form-label {
  display: block; font-family: var(--font-mono); font-size: 10px;
  letter-spacing: 2px; text-transform: uppercase; color: var(--muted); margin-bottom: 6px;
}
#hauler-root .form-input, #hauler-root .form-select {
  width: 100%; background: var(--surface); border: 1px solid var(--border);
  color: var(--text); font-family: var(--font-mono); font-size: 13px;
  padding: 10px 14px; border-radius: 3px; outline: none; transition: border-color 0.2s;
  -webkit-appearance: none;
}
#hauler-root .form-input:focus, #hauler-root .form-select:focus {
  border-color: var(--accent2); box-shadow: 0 0 0 2px rgba(0,212,255,0.1);
}
#hauler-root .form-select option { background: var(--surface); }
#hauler-root .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
#hauler-root .form-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }

#hauler-root .btn {
  padding: 12px 28px; font-family: var(--font-display); font-weight: 700;
  font-size: 13px; letter-spacing: 3px; text-transform: uppercase;
  border: none; border-radius: 3px; cursor: pointer; transition: all 0.2s;
}
#hauler-root .btn-primary { background: var(--accent); color: var(--black); }
#hauler-root .btn-primary:hover { background: #ffc04a; transform: translateY(-1px); }
#hauler-root .btn-outline {
  background: transparent; color: var(--accent2); border: 1px solid var(--accent2);
}
#hauler-root .btn-outline:hover { background: rgba(0,212,255,0.1); }
#hauler-root .btn-outline.active { background: rgba(0,212,255,0.1); border-color: var(--accent2); }
#hauler-root .btn-danger { background: transparent; color: var(--red); border: 1px solid var(--red); }

#hauler-root .stat-card {
  background: var(--card); border: 1px solid var(--border);
  border-radius: 4px; padding: 20px; position: relative; overflow: hidden;
}
#hauler-root .stat-label {
  font-family: var(--font-mono); font-size: 10px; letter-spacing: 2px;
  text-transform: uppercase; color: var(--muted); margin-bottom: 8px;
}
#hauler-root .stat-value {
  font-family: var(--font-display); font-weight: 900; font-size: 36px; line-height: 1; margin-bottom: 4px;
}
#hauler-root .stat-sub { font-family: var(--font-mono); font-size: 11px; color: var(--muted); }
#hauler-root .stat-accent { border-top: 2px solid var(--accent); }
#hauler-root .stat-green { border-top: 2px solid var(--green); }
#hauler-root .stat-red { border-top: 2px solid var(--red); }
#hauler-root .stat-blue { border-top: 2px solid var(--accent2); }

#hauler-root .verdict {
  padding: 20px 24px; border-radius: 4px; display: flex; align-items: center; gap: 16px;
  font-family: var(--font-display); font-weight: 700; font-size: 20px;
  letter-spacing: 2px; text-transform: uppercase; margin-top: 20px;
}
#hauler-root .verdict-details {
  font-family: var(--font-body); font-size: 13px; font-weight: 400;
  letter-spacing: 0; color: rgba(255,255,255,0.7); margin-top: 3px;
}
#hauler-root .verdict.go { background: rgba(0,230,118,0.12); border: 1px solid var(--green); color: var(--green); }
#hauler-root .verdict.warn { background: rgba(255,224,0,0.1); border: 1px solid var(--yellow); color: var(--yellow); }
#hauler-root .verdict.nogo { background: rgba(255,59,59,0.1); border: 1px solid var(--red); color: var(--red); }

#hauler-root .breakdown { width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: 12px; }
#hauler-root .breakdown tr { border-bottom: 1px solid rgba(31,45,74,0.6); }
#hauler-root .breakdown tr:last-child { border-bottom: none; }
#hauler-root .breakdown td { padding: 10px 0; }
#hauler-root .breakdown td:last-child { text-align: right; }
#hauler-root .breakdown .total-row td {
  font-weight: 600; color: var(--accent); font-size: 13px;
  padding-top: 14px; border-top: 1px solid var(--border);
}

#hauler-root .ring-wrap {
  display: flex; align-items: center; justify-content: center;
  position: relative; width: 160px; height: 160px; margin: 0 auto;
}
#hauler-root .ring-wrap svg { position: absolute; }
#hauler-root .ring-center { text-align: center; z-index: 1; }
#hauler-root .ring-value { font-family: var(--font-display); font-weight: 900; font-size: 32px; line-height: 1; }
#hauler-root .ring-unit { font-family: var(--font-mono); font-size: 10px; color: var(--muted); letter-spacing: 1px; }

#hauler-root .load-table { width: 100%; border-collapse: collapse; font-size: 13px; }
#hauler-root .load-table th {
  font-family: var(--font-mono); font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
  color: var(--muted); padding: 10px 14px; text-align: left; border-bottom: 1px solid var(--border);
}
#hauler-root .load-table td {
  padding: 12px 14px; border-bottom: 1px solid rgba(31,45,74,0.4);
  font-family: var(--font-body); vertical-align: middle;
}
#hauler-root .load-table tr:hover td { background: rgba(255,255,255,0.02); }

#hauler-root .badge {
  display: inline-block; padding: 3px 9px; border-radius: 3px; font-family: var(--font-mono);
  font-size: 10px; letter-spacing: 1px; text-transform: uppercase; font-weight: 600;
}
#hauler-root .badge-go { background: rgba(0,230,118,0.15); color: var(--green); border: 1px solid rgba(0,230,118,0.3); }
#hauler-root .badge-warn { background: rgba(255,224,0,0.12); color: var(--yellow); border: 1px solid rgba(255,224,0,0.3); }
#hauler-root .badge-nogo { background: rgba(255,59,59,0.12); color: var(--red); border: 1px solid rgba(255,59,59,0.3); }

#hauler-root .comm-output {
  background: var(--surface); border: 1px solid var(--border); border-radius: 3px;
  padding: 18px; font-family: var(--font-mono); font-size: 12px; line-height: 1.9;
  color: var(--text); white-space: pre-wrap; min-height: 180px; position: relative;
}
#hauler-root .copy-btn {
  position: absolute; top: 10px; right: 10px; background: var(--border);
  border: none; color: var(--muted); font-family: var(--font-mono); font-size: 10px;
  letter-spacing: 1px; padding: 5px 10px; border-radius: 3px; cursor: pointer; transition: all 0.2s;
}
#hauler-root .copy-btn:hover:not(:disabled) { background: var(--accent); color: var(--black); }
#hauler-root .copy-btn:disabled { opacity: 0.4; cursor: default; }

@keyframes h-fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
#hauler-root .animate-in { animation: h-fadeInUp 0.4s ease forwards; }

#hauler-root .divider { border: none; border-top: 1px solid var(--border); margin: 24px 0; }
#hauler-root .text-green { color: var(--green); }
#hauler-root .text-red { color: var(--red); }
#hauler-root .text-yellow { color: var(--yellow); }
#hauler-root .text-accent { color: var(--accent); }
#hauler-root .text-blue { color: var(--accent2); }
#hauler-root .text-muted { color: var(--muted); }

#hauler-root .section-title {
  font-family: var(--font-display); font-weight: 900; font-size: 22px;
  letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px;
}
#hauler-root .section-sub { font-size: 13px; color: var(--muted); margin-bottom: 24px; }

#hauler-root .ticker {
  background: var(--surface); border-bottom: 1px solid var(--border);
  overflow: hidden; height: 34px; display: flex; align-items: center;
}
#hauler-root .ticker-label {
  background: var(--accent); color: var(--black); font-family: var(--font-display);
  font-weight: 900; font-size: 11px; letter-spacing: 2px; padding: 0 14px;
  height: 100%; display: flex; align-items: center; flex-shrink: 0; white-space: nowrap;
}
#hauler-root .ticker-scroll {
  display: flex; animation: h-scroll 30s linear infinite; white-space: nowrap;
}
@keyframes h-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
#hauler-root .ticker-item {
  font-family: var(--font-mono); font-size: 11px; color: var(--muted);
  padding: 0 28px; border-right: 1px solid var(--border);
}
#hauler-root .ticker-item span { color: var(--accent2); }

#hauler-root input[type=range] {
  -webkit-appearance: none; width: 100%; height: 4px;
  background: var(--border); border-radius: 4px; outline: none;
}
#hauler-root input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none; width: 16px; height: 16px;
  background: var(--accent); border-radius: 50%; cursor: pointer;
}

@media (max-width: 768px) {
  #hauler-root .grid-2, #hauler-root .grid-3, #hauler-root .grid-4 { grid-template-columns: 1fr; }
  #hauler-root .form-row, #hauler-root .form-row-3 { grid-template-columns: 1fr; }
  #hauler-root header { padding: 0 16px; }
  #hauler-root .main { padding: 16px; }
  #hauler-root .nav-tabs { padding: 0 8px; overflow-x: auto; }
  #hauler-root .nav-tab { padding: 12px 14px; font-size: 11px; }
}
`

function buildTickerItems(dieselData: DieselPrices | undefined): TickerItem[] {
  const fmtPrice = (p: number) => `$${p.toFixed(2)}/gal`
  const fmtDelta = (d: number) => `${d >= 0 ? '+' : ''}$${d.toFixed(2)}`

  const mkDiesel = (label: string, price: number | null | undefined, d: number | null | undefined): TickerItem =>
    dieselData?.available && price != null
      ? { label, value: fmtPrice(price), delta: d != null ? fmtDelta(d) : undefined, deltaUp: (d ?? 0) > 0, stale: dieselData.stale, period: dieselData.period ?? undefined }
      : { label, value: '--' }

  return [
    ...STATIC_TICKER_ITEMS.slice(0, 4),
    mkDiesel('DIESEL EAST',    dieselData?.eastPrice,    dieselData?.eastDelta),
    mkDiesel('DIESEL MIDWEST', dieselData?.midwestPrice, dieselData?.midwestDelta),
    mkDiesel('DIESEL SOUTH',   dieselData?.southPrice,   dieselData?.southDelta),
    mkDiesel('DIESEL ROCKY',   dieselData?.rockyPrice,   dieselData?.rockyDelta),
    mkDiesel('DIESEL WEST',    dieselData?.westPrice,    dieselData?.westDelta),
    ...STATIC_TICKER_ITEMS.slice(4),
  ]
}

export function TruckerLandingPage() {
  const [activePage, setActivePage] = useState('load-analyzer')
  const [clock, setClock] = useState('')
  const [loadLog, setLoadLog] = useState<LogEntry[]>(() =>
    JSON.parse(localStorage.getItem('hauler_load_log') || '[]')
  )

  const { data: dieselData } = useDieselPrices()

  useEffect(() => {
    const el = document.createElement('style')
    el.id = 'hauler-styles'
    el.textContent = CSS
    document.head.appendChild(el)
    document.body.classList.add('hauler-active')
    return () => {
      document.getElementById('hauler-styles')?.remove()
      document.body.classList.remove('hauler-active')
    }
  }, [])

  useEffect(() => {
    const update = () =>
      setClock(new Date().toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }))
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [])

  function addLogEntry(entry: LogEntry) {
    setLoadLog(prev => {
      const updated = [entry, ...prev].slice(0, 50)
      localStorage.setItem('hauler_load_log', JSON.stringify(updated))
      return updated
    })
  }

  function clearLog() {
    if (!window.confirm('Clear all load history?')) return
    setLoadLog([])
    localStorage.removeItem('hauler_load_log')
  }

  const logTotal = loadLog.length
  const logAvgRPM = logTotal > 0 ? (loadLog.reduce((a, l) => a + parseFloat(l.rpm), 0) / logTotal).toFixed(2) : null
  const logTotalMiles = loadLog.reduce((a, l) => a + l.miles, 0)
  const logGoRate = logTotal > 0 ? ((loadLog.filter(l => l.verdict === 'go').length / logTotal) * 100).toFixed(0) + '%' : null

  const tickerItems = useMemo(() => buildTickerItems(dieselData), [dieselData])
  const tickerItemsDoubled = useMemo(() => [...tickerItems, ...tickerItems], [tickerItems])

  return (
    <div id="hauler-root">

      {/* TICKER */}
      <div className="ticker">
        <div className="ticker-label">MARKET LIVE</div>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <div className="ticker-scroll">
            {tickerItemsDoubled.map((item, i) => (
              <span key={i} className="ticker-item">
                {item.label}: <span title={item.period ? `Week of ${item.period}` : undefined}>{item.stale ? '⚠ ' : ''}{item.value}</span>
                {item.delta && (
                  <span style={{ color: item.deltaUp ? 'var(--red)' : 'var(--green)', marginLeft: '4px' }}>{item.delta}</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* HEADER */}
      <header>
        <div className="logo">HAULER<span>.</span></div>
        <div className="header-meta">
          <div><span className="live-dot" />FMCSA Compliant · HOS Tracking</div>
          <div>{clock}</div>
        </div>
      </header>

      {/* NAV */}
      <nav className="nav-tabs">
        {[
          { id: 'load-analyzer', label: '📦 Load Analyzer' },
          { id: 'cpm-calc', label: '💰 CPM Calculator' },
          { id: 'broker-comm', label: '📋 Broker Comms' },
          { id: 'load-log', label: '📊 Load Log' },
        ].map(tab => (
          <div key={tab.id} className={`nav-tab${activePage === tab.id ? ' active' : ''}`} onClick={() => setActivePage(tab.id)}>
            {tab.label}
          </div>
        ))}
      </nav>

      {/* MAIN */}
      <div className="main">

        {activePage === 'load-analyzer' && (
          <LoadAnalyzer dieselData={dieselData} onAddLogEntry={addLogEntry} />
        )}

        {activePage === 'cpm-calc' && (
          <CpmCalculator dieselData={dieselData} />
        )}

        {activePage === 'broker-comm' && (
          <CommunicationBuilder />
        )}

        {activePage === 'load-log' && (
          <div className="animate-in">
            <div className="section-title">Load History Log</div>
            <div className="section-sub">Track analyzed loads and profitability over time</div>

            <div className="grid-4 mb-16">
              <div className="stat-card stat-green">
                <div className="stat-label">Total Loads</div>
                <div className="stat-value text-green">{logTotal}</div>
              </div>
              <div className="stat-card stat-accent">
                <div className="stat-label">Avg RPM</div>
                <div className="stat-value text-accent">{logAvgRPM ? '$' + logAvgRPM : '—'}</div>
              </div>
              <div className="stat-card stat-blue">
                <div className="stat-label">Total Miles</div>
                <div className="stat-value text-blue">{logTotalMiles.toLocaleString()}</div>
              </div>
              <div className="stat-card stat-red">
                <div className="stat-label">GO Rate</div>
                <div className="stat-value text-green">{logGoRate ?? '—'}</div>
              </div>
            </div>

            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div className="card-title" style={{ margin: 0 }}>Recent Load Analyses</div>
                <button className="btn btn-danger" onClick={clearLog} style={{ fontSize: 11, padding: '7px 16px' }}>CLEAR LOG</button>
              </div>

              {logTotal === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                  No loads analyzed yet. Use the Load Analyzer tab to get started.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="load-table">
                    <thead>
                      <tr>
                        <th>Lane</th><th>Equipment</th><th>Miles</th>
                        <th>Rate</th><th>RPM</th><th>Profit</th><th>Verdict</th><th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadLog.map((l, i) => (
                        <tr key={i}>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{l.origin} → {l.dest}</td>
                          <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>{l.equip}</span></td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>{l.miles.toLocaleString()}</td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>${l.rate.toLocaleString()}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>${l.rpm}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', color: parseFloat(l.profit) >= 0 ? 'var(--green)' : 'var(--red)' }}>${parseFloat(l.profit).toLocaleString()}</td>
                          <td><span className={`badge badge-${l.verdict}`}>{l.verdict.toUpperCase()}</span></td>
                          <td style={{ color: 'var(--muted)', fontSize: 12 }}>{l.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
