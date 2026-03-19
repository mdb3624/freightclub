import { Link } from 'react-router-dom'
import './TruckerLandingPage.css'

const TICKER_ITEMS = [
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

const SAMPLE_LOADS = [
  {
    origin: 'Chicago, IL',
    dest: 'Dallas, TX',
    miles: 920,
    rate: '$2,156',
    rpm: '2.34',
    equip: 'Dry Van',
    pickup: 'Mar 22',
    badge: 'green' as const,
    badgeLabel: 'GO',
  },
  {
    origin: 'Atlanta, GA',
    dest: 'Memphis, TN',
    miles: 390,
    rate: '$1,040',
    rpm: '2.67',
    equip: 'Reefer',
    pickup: 'Mar 23',
    badge: 'green' as const,
    badgeLabel: 'GO',
  },
  {
    origin: 'Phoenix, AZ',
    dest: 'Los Angeles, CA',
    miles: 370,
    rate: '$780',
    rpm: '2.11',
    equip: 'Flatbed',
    pickup: 'Mar 23',
    badge: 'yellow' as const,
    badgeLabel: 'CAUTION',
  },
  {
    origin: 'Denver, CO',
    dest: 'Kansas City, MO',
    miles: 600,
    rate: '—',
    rpm: '—',
    equip: 'Dry Van',
    pickup: 'Mar 24',
    badge: 'blue' as const,
    badgeLabel: 'OPEN',
    blurred: true,
  },
]

const FEATURES = [
  {
    icon: '📦',
    title: 'Load Board',
    desc: 'Browse available loads filtered by equipment type, origin state, destination state, and pickup date. Claim a load instantly and get shipper contact details.',
    tag: 'Live',
  },
  {
    icon: '💰',
    title: 'Profitability Analyzer',
    desc: 'Enter miles, deadhead, and offered rate — get an instant GO / NO-GO verdict with RPM breakdown, fuel cost, and net profit vs. your personal CPM floor.',
    tag: 'Built-in',
  },
  {
    icon: '⏱',
    title: 'HOS Tracker',
    desc: 'FMCSA compliant Hours of Service tracking. Know your 11-hr drive, 14-hr on-duty, and 70-hr/8-day cycle at a glance. Dispatcher alert built in.',
    tag: 'FMCSA §395',
  },
  {
    icon: '📋',
    title: 'Broker Comms',
    desc: 'Generate professional rate confirmation requests, counter-offers, detention claims, and TONU letters in seconds. Copy and send — done.',
    tag: 'Templates',
  },
]

const STEPS = [
  {
    num: '01',
    title: 'Create Profile',
    desc: 'Enter your MC#, DOT#, equipment type, and home base. Takes 2 minutes.',
  },
  {
    num: '02',
    title: 'Browse Loads',
    desc: 'Filter the live board by equipment, origin state, destination, and date.',
  },
  {
    num: '03',
    title: 'Claim & Go',
    desc: 'Claim the load you want. Get shipper contact info and rate confirmation instantly.',
  },
  {
    num: '04',
    title: 'Track & Earn',
    desc: 'Update load status from pickup through delivery. Your earnings summary updates in real time.',
  },
]

export function TruckerLandingPage() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS]

  return (
    <div className="lp">
      <div className="lp-grid-bg" />

      {/* TICKER */}
      <div className="lp-ticker">
        <div className="lp-ticker-label">MARKET LIVE</div>
        <div className="lp-ticker-track">
          <div className="lp-ticker-scroll">
            {doubled.map(([k, v], i) => (
              <span key={i} className="lp-ticker-item">
                {k}: <span>{v}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* HEADER */}
      <header className="lp-header">
        <div className="lp-logo">
          FREIGHTCLUB<span>.</span>
        </div>
        <nav className="lp-header-nav">
          <Link to="/login" className="lp-btn lp-btn-outline">Sign In</Link>
          <Link to="/register" className="lp-btn lp-btn-primary">Get Started</Link>
        </nav>
      </header>

      {/* HERO */}
      <section className="lp-hero">
        <div className="lp-hero-eyebrow">
          <span className="lp-live-dot" />
          Owner-Operator Platform · 48 States · FMCSA Compliant
        </div>
        <h1>
          Find Loads.<br />
          Know Your <em>Numbers.</em><br />
          Stay Rolling.
        </h1>
        <p className="lp-hero-sub">
          FreightClub is the load board built for independent owner-operators.
          Real loads, real rates, and the intelligence tools to never haul at a loss.
        </p>
        <div className="lp-hero-ctas">
          <Link to="/register" className="lp-btn lp-btn-primary lp-btn-lg">
            Find Loads Now →
          </Link>
          <Link to="/login" className="lp-btn lp-btn-outline lp-btn-lg">
            Sign In
          </Link>
        </div>
      </section>

      {/* STAT BAR */}
      <div className="lp-stat-bar">
        <div className="lp-stat-bar-inner">
          <div className="lp-stat">
            <div className="lp-stat-value">2,400<span style={{ fontSize: 24, color: 'var(--accent2)' }}>+</span></div>
            <div className="lp-stat-label">Active Loads</div>
          </div>
          <div className="lp-stat">
            <div className="lp-stat-value" style={{ color: 'var(--green)' }}>$2.14</div>
            <div className="lp-stat-label">Avg RPM Today</div>
          </div>
          <div className="lp-stat">
            <div className="lp-stat-value" style={{ color: 'var(--accent2)' }}>48</div>
            <div className="lp-stat-label">States Covered</div>
          </div>
          <div className="lp-stat">
            <div className="lp-stat-value" style={{ color: 'var(--yellow)' }}>0%</div>
            <div className="lp-stat-label">Brokerage Markup</div>
          </div>
        </div>
      </div>

      {/* SAMPLE LOAD BOARD */}
      <div className="lp-divider-section">
        <div className="lp-section">
          <div className="lp-section-header">
            <div className="lp-section-eyebrow">Live Load Board</div>
            <div className="lp-section-title">Available Loads Right Now</div>
            <div className="lp-section-sub">
              Sign up to see all loads, claim instantly, and unlock the full profitability analysis on every lane.
            </div>
          </div>

          <div style={{ overflowX: 'auto', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--card)' }}>
            <table className="lp-load-table">
              <thead>
                <tr>
                  <th>Origin → Destination</th>
                  <th>Equipment</th>
                  <th>Miles</th>
                  <th>Rate</th>
                  <th>RPM</th>
                  <th>Pickup</th>
                  <th>Verdict</th>
                </tr>
              </thead>
              <tbody>
                {SAMPLE_LOADS.map((load, i) => (
                  <tr key={i} className={load.blurred ? 'lp-table-blur-row' : ''}>
                    <td className="lp-mono">{load.origin} → {load.dest}</td>
                    <td style={{ color: 'var(--muted)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>{load.equip}</td>
                    <td className="lp-mono">{load.miles.toLocaleString()}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{load.rate}</td>
                    <td><span className="lp-rpm">{load.rpm}</span></td>
                    <td style={{ color: 'var(--muted)', fontSize: 12 }}>{load.pickup}</td>
                    <td>
                      <span className={`lp-badge lp-badge-${load.badge}`}>{load.badgeLabel}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Link to="/register" className="lp-btn lp-btn-primary">
              Unlock All Loads →
            </Link>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <section className="lp-section">
        <div className="lp-section-header">
          <div className="lp-section-eyebrow">Platform Features</div>
          <div className="lp-section-title">Everything You Need on One Screen</div>
          <div className="lp-section-sub">
            No switching between apps. Your load board, profitability tools, HOS tracker, and broker communication templates — all integrated.
          </div>
        </div>
        <div className="lp-feature-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="lp-feature-card">
              <div className="lp-feature-icon">{f.icon}</div>
              <div className="lp-feature-title">{f.title}</div>
              <div className="lp-feature-desc">{f.desc}</div>
              <span className="lp-feature-tag">{f.tag}</span>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <div className="lp-divider-section">
        <section className="lp-section">
          <div className="lp-section-header">
            <div className="lp-section-eyebrow">How It Works</div>
            <div className="lp-section-title">Up and Running in Minutes</div>
          </div>
          <div className="lp-steps">
            {STEPS.map((s, i) => (
              <div key={i} className="lp-step">
                <div className="lp-step-num">{s.num}</div>
                <div className="lp-step-title">{s.title}</div>
                <div className="lp-step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* CTA */}
      <section className="lp-cta-section">
        <h2>Ready to <em>Roll?</em></h2>
        <p className="lp-cta-sub">
          Join owner-operators across 48 states running smarter freight.
        </p>
        <div className="lp-hero-ctas">
          <Link to="/register" className="lp-btn lp-btn-primary lp-btn-lg">
            Create Free Account →
          </Link>
          <Link to="/login" className="lp-btn lp-btn-outline lp-btn-lg">
            Sign In
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="lp-footer-logo">
          FREIGHTCLUB<span>.</span>
        </div>
        <div className="lp-footer-copy">
          © {new Date().getFullYear()} FREIGHTCLUB · FMCSA COMPLIANT · ALL RIGHTS RESERVED
        </div>
      </footer>
    </div>
  )
}
