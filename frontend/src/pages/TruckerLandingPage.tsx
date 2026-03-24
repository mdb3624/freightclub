import { useEffect, useState, useRef } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────

interface LogEntry {
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

interface HosResult {
  driveRemain: number
  ondutyRemain: number
  cycleRemain: number
  drive: number
  onduty: number
  cycle: number
  alertMsg: string
  breakWarning: boolean
}

interface CommField {
  id: string
  label: string
  placeholder: string
}

interface CommTemplate {
  label: string
  fields: CommField[]
  generate: (f: Record<string, string>) => string
}

// ── Constants ──────────────────────────────────────────────────────────────

const DIESEL = 3.89
const MAINT_CPM = 0.17

const TICKER_DATA: [string, string][] = [
  ['DIESEL NATL AVG', '$3.89/gal'],
  ['DRY VAN SPOT', '$2.14 RPM'],
  ['REEFER SPOT', '$2.76 RPM'],
  ['FLATBED SPOT', '$2.38 RPM'],
  ['DIESEL WEST', '$4.21/gal'],
  ['DIESEL SOUTH', '$3.72/gal'],
  ['LOAD-TO-TRUCK RATIO', '3.2:1'],
  ['CA→TX CORRIDOR', 'HIGH VOLUME'],
  ['MIDWEST REEFER', 'SEASONAL +12%'],
  ['FMCSA HOS', '11HR DRIVE / 14HR DUTY'],
]

const TICKER_DOUBLED = [...TICKER_DATA, ...TICKER_DATA]

const COMM_TEMPLATES: Record<string, CommTemplate> = {
  'rate-confirm': {
    label: 'Rate Confirmation Request',
    fields: [
      { id: 'cf-broker', label: 'Broker Name', placeholder: 'John / ABC Logistics' },
      { id: 'cf-load', label: 'Load Number', placeholder: '#LD-284732' },
      { id: 'cf-lane', label: 'Lane', placeholder: 'Chicago, IL → Dallas, TX' },
      { id: 'cf-rate', label: 'Agreed Rate ($)', placeholder: '2,100' },
      { id: 'cf-carrier', label: 'Carrier / Driver Name', placeholder: 'Mike Johnson / MJ Transport' },
      { id: 'cf-mc', label: 'MC Number', placeholder: 'MC-834211' },
    ],
    generate: (f) =>
      `Hi ${f['cf-broker']},\n\nPer our conversation, please send over the Rate Con for the below load at your earliest convenience:\n\nLoad #: ${f['cf-load']}\nLane: ${f['cf-lane']}\nAgreed Rate: $${f['cf-rate']}\nCarrier: ${f['cf-carrier']} | ${f['cf-mc']}\n\nPlease confirm all accessorials (lumper, TONU protection, detention after 2 hrs free time) are reflected on the Rate Con before we sign.\n\nThank you,\n${f['cf-carrier']}`,
  },
  counter: {
    label: 'Counter-Offer',
    fields: [
      { id: 'co-broker', label: 'Broker Name', placeholder: 'Sarah / Coyote Logistics' },
      { id: 'co-lane', label: 'Lane', placeholder: 'Atlanta, GA → Memphis, TN' },
      { id: 'co-offered', label: 'Their Offer ($)', placeholder: '1,400' },
      { id: 'co-counter', label: 'Your Counter ($)', placeholder: '1,750' },
      { id: 'co-reason', label: 'Reason for Counter', placeholder: 'Heavy load, limited backhaul options' },
    ],
    generate: (f) =>
      `Hi ${f['co-broker']},\n\nThank you for the offer on ${f['co-lane']}.\n\nI've reviewed the lane and at $${f['co-offered']}, we'd be moving below our operating costs when factoring deadhead and ${f['co-reason']}. The market is currently supporting this lane closer to $${f['co-counter']}.\n\nCounter-offer: $${f['co-counter']} all-in.\n\nLet me know if that works — we're ready to move on this today.\n\nBest,`,
  },
  detention: {
    label: 'Detention Request',
    fields: [
      { id: 'det-broker', label: 'Broker Name', placeholder: 'Tom / Echo Global' },
      { id: 'det-load', label: 'Load Number', placeholder: '#LD-993847' },
      { id: 'det-arrive', label: 'Scheduled Appt Time', placeholder: '08:00 AM' },
      { id: 'det-start', label: 'Actual Load Start Time', placeholder: '10:45 AM' },
      { id: 'det-hrs', label: 'Detention Hours Billed', placeholder: '2.75' },
      { id: 'det-rate', label: 'Detention Rate ($/hr)', placeholder: '75' },
    ],
    generate: (f) => {
      const total = (parseFloat(f['det-hrs'] || '0') * parseFloat(f['det-rate'] || '75')).toFixed(0)
      return `Hi ${f['det-broker']},\n\nI'm writing to formally document and request detention pay for load #${f['det-load']}.\n\nScheduled appointment: ${f['det-arrive']}\nLoading did not begin until: ${f['det-start']}\nTotal billable detention hours: ${f['det-hrs']} hours\n\nPer our standard agreement (2 hrs free time), we are billing:\n${f['det-hrs']} hrs × $${f['det-rate']}/hr = $${total}\n\nPlease add this to the settlement or confirm via updated Rate Con. Supporting documentation (ELD timestamps, signed BOL) available upon request.\n\nThank you,`
    },
  },
  tonu: {
    label: 'TONU (Truck Order Not Used)',
    fields: [
      { id: 'tn-broker', label: 'Broker Name', placeholder: 'Lisa / TQL' },
      { id: 'tn-load', label: 'Load Number', placeholder: '#LD-112233' },
      { id: 'tn-cancel', label: 'When Load Was Cancelled', placeholder: '2 hrs before pickup' },
      { id: 'tn-dh', label: 'DH Miles Already Driven', placeholder: '85' },
      { id: 'tn-amount', label: 'TONU Amount Requested ($)', placeholder: '250' },
    ],
    generate: (f) =>
      `Hi ${f['tn-broker']},\n\nThis is a formal TONU (Truck Order Not Used) claim for load #${f['tn-load']}.\n\nThe load was cancelled ${f['tn-cancel']} with ${f['tn-dh']} deadhead miles already committed. We had repositioned our asset specifically for this load, resulting in direct financial loss.\n\nTONU Claim: $${f['tn-amount']}\n\nPer FMCSA guidelines and standard industry practice, cancellations with less than 24-hour notice are subject to TONU compensation. Please process this at your earliest convenience to maintain our carrier relationship.\n\nIf you have questions, please contact me directly.\n\nRegards,`,
  },
  'cold-shipper': {
    label: 'Cold Shipper Outreach',
    fields: [
      { id: 'cs-contact', label: 'Shipper Contact Name', placeholder: 'Mr. Rodriguez' },
      { id: 'cs-company', label: 'Shipper Company', placeholder: 'ABC Manufacturing' },
      { id: 'cs-equip', label: 'Equipment Type', placeholder: 'Dry Van' },
      { id: 'cs-region', label: 'Your Service Region', placeholder: 'Midwest & Southeast' },
      { id: 'cs-carrier', label: 'Your Company Name', placeholder: 'Eagle Freight LLC' },
    ],
    generate: (f) =>
      `Hi ${f['cs-contact']},\n\nMy name is [Your Name] with ${f['cs-carrier']}, a licensed and insured carrier (FMCSA) specializing in ${f['cs-equip']} loads throughout the ${f['cs-region']} corridor.\n\nI'm reaching out because we have consistent capacity in lanes that align with ${f['cs-company']}'s shipping patterns and are interested in establishing a reliable direct-carrier relationship.\n\nWhat we offer:\n→ Direct carrier (no brokerage markup)\n→ Real-time GPS tracking & ELD compliance\n→ 24/7 dispatch communication\n→ Competitive contract rates with guaranteed capacity\n\nMany of our shipper partners save 15–25% by going direct vs. spot market rates.\n\nWould you be open to a 10-minute call this week to discuss your current freight needs? I'm happy to provide references and our carrier packet.\n\nBest regards,\n[Your Name] | ${f['cs-carrier']}\nMC: [Your MC#] | DOT: [Your DOT#]`,
  },
}

// ── Scoped CSS (injected via <style> tag) ─────────────────────────────────

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

#hauler-root .hos-bar-wrap { margin: 10px 0; }
#hauler-root .hos-label-row {
  display: flex; justify-content: space-between; font-family: var(--font-mono);
  font-size: 11px; color: var(--muted); margin-bottom: 5px;
}
#hauler-root .hos-bar {
  height: 12px; background: var(--surface); border-radius: 6px;
  overflow: hidden; border: 1px solid var(--border);
}
#hauler-root .hos-fill { height: 100%; border-radius: 6px; transition: width 0.6s ease; }

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

// ── Component ──────────────────────────────────────────────────────────────

export function TruckerLandingPage() {
  // UI
  const [activePage, setActivePage] = useState('load-analyzer')
  const [clock, setClock] = useState('')

  // Load Log
  const [loadLog, setLoadLog] = useState<LogEntry[]>(() =>
    JSON.parse(localStorage.getItem('hauler_load_log') || '[]')
  )

  // Load Analyzer — uncontrolled inputs
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

  // CPM Calculator — controlled
  const [cpmForm, setCpmForm] = useState({
    truck: '', ins: '', permits: '', misc: '',
    diesel: '3.89', mpg: '6.5', maint: '0.17', perdiem: '', miles: '', margin: '0.60',
  })
  const [cpmResult, setCpmResult] = useState<CpmResult | null>(null)

  // HOS Tracker — controlled
  const [hosForm, setHosForm] = useState({
    drive: '', onduty: '', cycle: '', lastbreak: '', milesLeft: '', speed: '55',
  })
  const [hosResult, setHosResult] = useState<HosResult | null>(null)

  // Broker Comms
  const [commType, setCommType] = useState('rate-confirm')
  const [commFields, setCommFields] = useState<Record<string, string>>({})
  const [commOutput, setCommOutput] = useState('')
  const [commCopied, setCommCopied] = useState(false)

  // ── Effects ──

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

  // CPM auto-calc
  useEffect(() => {
    const miles = parseFloat(cpmForm.miles) || 0
    if (!miles) { setCpmResult(null); return }
    const truck = parseFloat(cpmForm.truck) || 0
    const ins = parseFloat(cpmForm.ins) || 0
    const permits = parseFloat(cpmForm.permits) || 0
    const misc = parseFloat(cpmForm.misc) || 0
    const diesel = parseFloat(cpmForm.diesel) || 3.89
    const mpg = parseFloat(cpmForm.mpg) || 6.5
    const maint = parseFloat(cpmForm.maint) || 0.17
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

  // HOS auto-calc
  useEffect(() => {
    const drive = parseFloat(hosForm.drive) || 0
    const onduty = parseFloat(hosForm.onduty) || 0
    const cycle = parseFloat(hosForm.cycle) || 0
    if (!drive && !onduty && !cycle) { setHosResult(null); return }
    const lastbreak = parseFloat(hosForm.lastbreak) || 0
    const milesLeft = parseFloat(hosForm.milesLeft) || 0
    const speed = parseFloat(hosForm.speed) || 55
    const driveRemain = Math.max(11 - drive, 0)
    const ondutyRemain = Math.max(14 - onduty, 0)
    const cycleRemain = Math.max(70 - cycle, 0)
    const effectiveDrive = Math.min(driveRemain, ondutyRemain)
    const hoursNeeded = milesLeft > 0 ? milesLeft / speed : 0

    let alertMsg = ''
    if (drive >= 11)
      alertMsg = `🚨 VIOLATION: Driver has reached 11-hr drive limit. MUST take 10-hr consecutive off-duty break.`
    else if (onduty >= 14)
      alertMsg = `🚨 VIOLATION: 14-hour window expired. No more driving allowed until 10-hr reset.`
    else if (milesLeft && hoursNeeded > effectiveDrive)
      alertMsg = `⚠️ CLOCK WARNING: Load needs ~${hoursNeeded.toFixed(1)} hrs at ${speed} mph but only ${effectiveDrive.toFixed(1)} hrs remain. Driver will be ~${(hoursNeeded - effectiveDrive).toFixed(1)} hrs short. Plan a 10-hr reset or split sleeper.`
    else if (effectiveDrive <= 2)
      alertMsg = `⚠️ LOW ON TIME: Only ${effectiveDrive.toFixed(1)} hrs of effective drive time remain. Dispatch with caution.`
    else if (cycle >= 70)
      alertMsg = `🚨 CYCLE VIOLATION: 70-hr limit reached. Requires 34-hr restart before driving.`
    else
      alertMsg = `✅ COMPLIANT: Driver has ${driveRemain.toFixed(1)} drive hrs and ${ondutyRemain.toFixed(1)} on-duty hrs remaining.${milesLeft ? ` Est. ${hoursNeeded.toFixed(1)} hrs needed for remaining ${milesLeft} miles.` : ''}`

    setHosResult({ driveRemain, ondutyRemain, cycleRemain, drive, onduty, cycle, alertMsg, breakWarning: drive >= 8 && lastbreak < 0.5 })
  }, [hosForm])

  // Reset comm fields when type changes
  useEffect(() => { setCommFields({}); setCommOutput('') }, [commType])

  // ── Handlers ──

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
    const fuelCPM = DIESEL / 6.5
    const fuelCost = totalMiles * fuelCPM
    const maintCost = totalMiles * MAINT_CPM
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

    const entry: LogEntry = { origin, dest, equip: equip.toUpperCase(), miles: totalMiles, rate: totalRevenue, rpm: rpm.toFixed(2), profit: profit.toFixed(0), verdict, date: new Date().toLocaleDateString() }
    setLoadLog(prev => { const updated = [entry, ...prev].slice(0, 50); localStorage.setItem('hauler_load_log', JSON.stringify(updated)); return updated })
  }

  function generateComm() {
    const tmpl = COMM_TEMPLATES[commType]
    const vals: Record<string, string> = {}
    tmpl.fields.forEach(f => { vals[f.id] = commFields[f.id] || f.placeholder })
    setCommOutput(tmpl.generate(vals))
  }

  function copyComm() {
    navigator.clipboard.writeText(commOutput).then(() => { setCommCopied(true); setTimeout(() => setCommCopied(false), 2000) })
  }

  function clearLog() {
    if (!window.confirm('Clear all load history?')) return
    setLoadLog([])
    localStorage.removeItem('hauler_load_log')
  }

  // ── Derived for Load Log ──
  const logTotal = loadLog.length
  const logAvgRPM = logTotal > 0 ? (loadLog.reduce((a, l) => a + parseFloat(l.rpm), 0) / logTotal).toFixed(2) : null
  const logTotalMiles = loadLog.reduce((a, l) => a + l.miles, 0)
  const logGoRate = logTotal > 0 ? ((loadLog.filter(l => l.verdict === 'go').length / logTotal) * 100).toFixed(0) + '%' : null

  // ── CPM ring ──
  const cpmRingColor = cpmResult ? (cpmResult.cpm < 1.50 ? 'var(--green)' : cpmResult.cpm < 2.20 ? 'var(--yellow)' : 'var(--red)') : 'var(--accent)'
  const cpmRingOffset = cpmResult ? 2 * Math.PI * 68 * (1 - Math.min(cpmResult.cpm / 3.50, 1)) : 2 * Math.PI * 68

  // ── HOS bar helpers ──
  const driveVal = parseFloat(hosForm.drive) || 0
  const ondutyVal = parseFloat(hosForm.onduty) || 0
  const cycleVal = parseFloat(hosForm.cycle) || 0
  const driveColor = driveVal > 9 ? 'var(--red)' : driveVal > 7 ? 'var(--yellow)' : 'var(--green)'
  const ondutyColor = ondutyVal > 12 ? 'var(--red)' : ondutyVal > 10 ? 'var(--yellow)' : 'var(--green)'
  const cycleColor = cycleVal > 60 ? 'var(--red)' : cycleVal > 50 ? 'var(--yellow)' : 'var(--accent2)'

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div id="hauler-root">

      {/* TICKER */}
      <div className="ticker">
        <div className="ticker-label">MARKET LIVE</div>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <div className="ticker-scroll">
            {TICKER_DOUBLED.map(([k, v], i) => (
              <span key={i} className="ticker-item">{k}: <span>{v}</span></span>
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
          { id: 'hos-tracker', label: '⏱ HOS Tracker' },
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

        {/* ═══════════════ PAGE 1: LOAD ANALYZER ═══════════════ */}
        {activePage === 'load-analyzer' && (
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
                    <input ref={laMiles} className="form-input" type="number" placeholder="e.g. 920" />
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
                    <div className="stat-label">Fuel Cost (@ ${DIESEL}/gal)</div>
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
        )}

        {/* ═══════════════ PAGE 2: CPM CALCULATOR ═══════════════ */}
        {activePage === 'cpm-calc' && (
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
        )}

        {/* ═══════════════ PAGE 3: HOS TRACKER ═══════════════ */}
        {activePage === 'hos-tracker' && (
          <div className="animate-in">
            <div className="section-title">Hours of Service Tracker</div>
            <div className="section-sub">FMCSA compliant HOS tracking — 11-hr drive, 14-hr on-duty, 70-hr/8-day cycle</div>

            <div className="grid-2 mb-16">
              <div className="card">
                <div className="card-title">Current Driver Status</div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Drive Hours Used Today</label>
                    <input className="form-input" type="number" step="0.25" max="11" placeholder="e.g. 4.5" value={hosForm.drive} onChange={e => setHosForm(f => ({ ...f, drive: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">On-Duty Hours Used Today</label>
                    <input className="form-input" type="number" step="0.25" max="14" placeholder="e.g. 6" value={hosForm.onduty} onChange={e => setHosForm(f => ({ ...f, onduty: e.target.value }))} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">70-Hour Cycle Used (Hrs)</label>
                    <input className="form-input" type="number" step="0.5" max="70" placeholder="e.g. 52" value={hosForm.cycle} onChange={e => setHosForm(f => ({ ...f, cycle: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Rest Break (Hrs Ago)</label>
                    <input className="form-input" type="number" step="0.25" placeholder="e.g. 3" value={hosForm.lastbreak} onChange={e => setHosForm(f => ({ ...f, lastbreak: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Estimated Miles Remaining on Load</label>
                  <input className="form-input" type="number" placeholder="e.g. 280" value={hosForm.milesLeft} onChange={e => setHosForm(f => ({ ...f, milesLeft: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Average Speed (MPH)</label>
                  <input className="form-input" type="number" value={hosForm.speed} onChange={e => setHosForm(f => ({ ...f, speed: e.target.value }))} />
                </div>
              </div>

              <div>
                <div className="card mb-16">
                  <div className="card-title">Drive Time Remaining (11-Hr Rule)</div>
                  <div className="hos-bar-wrap">
                    <div className="hos-label-row">
                      <span>{driveVal} hrs used</span>
                      <span style={{ color: driveColor }}>{(hosResult?.driveRemain ?? 11).toFixed(2)} hrs remaining</span>
                    </div>
                    <div className="hos-bar">
                      <div className="hos-fill" style={{ width: Math.min((driveVal / 11) * 100, 100) + '%', background: driveColor }} />
                    </div>
                  </div>
                </div>

                <div className="card mb-16">
                  <div className="card-title">On-Duty Window (14-Hr Rule)</div>
                  <div className="hos-bar-wrap">
                    <div className="hos-label-row">
                      <span>{ondutyVal} hrs used</span>
                      <span style={{ color: ondutyColor }}>{(hosResult?.ondutyRemain ?? 14).toFixed(2)} hrs remaining</span>
                    </div>
                    <div className="hos-bar">
                      <div className="hos-fill" style={{ width: Math.min((ondutyVal / 14) * 100, 100) + '%', background: ondutyColor }} />
                    </div>
                  </div>
                </div>

                <div className="card mb-16">
                  <div className="card-title">70-Hour / 8-Day Cycle</div>
                  <div className="hos-bar-wrap">
                    <div className="hos-label-row">
                      <span>{cycleVal} hrs used</span>
                      <span style={{ color: cycleColor }}>{(hosResult?.cycleRemain ?? 70).toFixed(2)} hrs remaining</span>
                    </div>
                    <div className="hos-bar">
                      <div className="hos-fill" style={{ width: Math.min((cycleVal / 70) * 100, 100) + '%', background: cycleColor }} />
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-title">Dispatcher Alert</div>
                  {hosResult ? (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: hosResult.alertMsg.startsWith('🚨') ? 'var(--red)' : hosResult.alertMsg.startsWith('⚠️') ? 'var(--yellow)' : 'var(--green)' }}>
                      {hosResult.alertMsg}
                    </span>
                  ) : (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)' }}>Enter driver hours to see status</span>
                  )}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-title">30-Minute Break Rule (§395.3)</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--muted)', lineHeight: 1.8 }}>
                A 30-minute break is required after <strong style={{ color: 'var(--text)' }}>8 cumulative hours</strong> of driving since last off-duty or sleeper period of ≥ 30 minutes.{' '}
                <span style={{ marginLeft: 10, color: hosResult?.breakWarning ? 'var(--yellow)' : 'var(--green)' }}>
                  {hosResult?.breakWarning ? '⚠️ 30-Min break REQUIRED (8+ drive hrs, no recent break)' : '✓ Compliant based on input'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ PAGE 4: BROKER COMMS ═══════════════ */}
        {activePage === 'broker-comm' && (
          <div className="animate-in">
            <div className="section-title">Broker Communication Drafts</div>
            <div className="section-sub">Generate professional carrier-broker communications instantly</div>

            <div className="grid-2 mb-16">
              <div>
                <div className="card mb-16">
                  <div className="card-title">Communication Type</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {Object.entries(COMM_TEMPLATES).map(([key, tmpl]) => (
                      <button key={key} className={`btn btn-outline${commType === key ? ' active' : ''}`} onClick={() => setCommType(key)} style={{ textAlign: 'left', letterSpacing: 1 }}>
                        {key === 'rate-confirm' ? '📄' : key === 'counter' ? '↕️' : key === 'detention' ? '⏰' : key === 'tonu' ? '❌' : '📞'} {tmpl.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <div className="card-title">Fill in Details</div>
                  {COMM_TEMPLATES[commType].fields.map(f => (
                    <div key={f.id} className="form-group">
                      <label className="form-label">{f.label}</label>
                      <input className="form-input" placeholder={f.placeholder} value={commFields[f.id] || ''} onChange={e => setCommFields(prev => ({ ...prev, [f.id]: e.target.value }))} />
                    </div>
                  ))}
                  <button className="btn btn-primary" style={{ width: '100%', marginTop: 12 }} onClick={generateComm}>
                    GENERATE MESSAGE →
                  </button>
                </div>
              </div>

              <div className="card">
                <div className="card-title">Generated Message</div>
                <div className="comm-output">
                  {commOutput || <span style={{ color: 'var(--muted)' }}>Select a template and fill in details to generate your message.</span>}
                  <button className="copy-btn" onClick={copyComm} disabled={!commOutput}>
                    {commCopied ? '✓ COPIED' : 'COPY'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ PAGE 5: LOAD LOG ═══════════════ */}
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
