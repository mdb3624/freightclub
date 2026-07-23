import { useEffect, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { LoginModal } from '@/features/auth/components/LoginModal'
import { SignupModal } from '@/features/auth/components/SignupModal'

type Tier = 'green' | 'yellow' | 'red'

const TIER_STYLES: Record<Tier, { bg: string; color: string; border: string }> = {
  green: { bg: 'rgba(34,197,94,0.12)', color: '#15803D', border: '#22C55E' },
  yellow: { bg: 'rgba(245,158,11,0.12)', color: '#B45309', border: '#F59E0B' },
  red: { bg: 'rgba(239,68,68,0.12)', color: '#B91C1C', border: '#EF4444' },
}

/**
 * Static demo RPM badge for the hero glass card — not real load data, so the
 * shared ProfitabilityBadge (which requires LoadSummary/CostProfile) doesn't apply.
 */
function DemoTierBadge({ rpm, tier }: { rpm: number; tier: Tier }) {
  const s = TIER_STYLES[tier]
  return (
    <span
      className="inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      ${rpm.toFixed(2)}/mi
    </span>
  )
}

function FeatureCard({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 rounded-md border border-shipper-accent bg-shipper-surface p-6 text-left shadow-sm transition-shadow hover:shadow-md">
      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#FBF5E8]">{icon}</div>
      <h3 className="font-display text-lg font-bold text-shipper-text">{title}</h3>
      <p className="text-sm leading-relaxed text-shipper-text-muted">{children}</p>
    </div>
  )
}

function StepIcon({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#E8D9B8] bg-[#FBF5E8]">
      {children}
    </div>
  )
}

const iconStroke = { stroke: '#8C6D3F', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' }

export function HomePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [loginOpen, setLoginOpen] = useState(false)
  const [signupOpen, setSignupOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const openLogin = () => {
    setMobileMenuOpen(false)
    setSignupOpen(false)
    setLoginOpen(true)
  }
  const openSignup = () => {
    setMobileMenuOpen(false)
    setLoginOpen(false)
    setSignupOpen(true)
  }
  const switchToSignup = () => {
    setLoginOpen(false)
    setSignupOpen(true)
  }
  const switchToLogin = () => {
    setSignupOpen(false)
    setLoginOpen(true)
  }

  // ProtectedRoute redirects unauthenticated/wrong-role users here with
  // { openLogin: true } — surface the login modal instead of a bare marketing page.
  useEffect(() => {
    if ((location.state as { openLogin?: boolean } | null)?.openLogin) {
      setLoginOpen(true)
      navigate('.', { replace: true, state: null })
    }
  }, [location.state, navigate])

  return (
    <div className="min-h-screen bg-shipper-bg font-sans text-shipper-text">
      {/* Header */}
      <header className="sticky top-0 z-50 flex min-h-16 items-center border-b border-[#D8CEB8] bg-white">
        <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-4 px-5">
          <img src="/assets/logo-full.png" alt="MDB Integrated Logistics" className="h-8 w-auto object-contain" />

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-shipper-text-muted hover:text-shipper-text">Product</a>
            <a href="#how-it-works" className="text-sm font-medium text-shipper-text-muted hover:text-shipper-text">How It Works</a>
            <a href="#pricing" className="text-sm font-medium text-shipper-text-muted hover:text-shipper-text">Pricing</a>
            <button
              type="button"
              data-testid="header-login-btn"
              onClick={openLogin}
              className="text-sm font-medium text-shipper-text-muted hover:text-shipper-text"
            >
              Log in
            </button>
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              data-testid="mobile-menu-toggle"
              aria-label="Menu"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="p-2 text-shipper-text"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" {...iconStroke}>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>

          {mobileMenuOpen && (
            <nav data-testid="mobile-nav" className="flex w-full flex-col gap-1 border-t border-shipper-bg py-2 md:hidden">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="px-1 py-3 text-base font-medium text-shipper-text">Product</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="px-1 py-3 text-base font-medium text-shipper-text">How It Works</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="px-1 py-3 text-base font-medium text-shipper-text">Pricing</a>
              <button type="button" data-testid="mobile-nav-login-btn" onClick={openLogin} className="px-1 py-3 text-left text-base font-medium text-shipper-text">Log in</button>
            </nav>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-12 px-8 pb-8 pt-16">
        <div className="flex min-w-[320px] flex-1 basis-[440px] flex-col gap-6">
          <span className="text-xs font-bold uppercase tracking-[0.1em] text-shipper-accent">
            Profitability-First Load Board
          </span>
          <h1 className="font-display text-5xl font-extrabold leading-[1.15] tracking-tight text-shipper-text">
            The only load board that tells you if a load is worth it.
          </h1>
          <p className="max-w-[480px] text-lg leading-relaxed text-shipper-text-muted">
            Stop guessing. Start profiting. Build your true cost profile and instantly see per-load profitability
            before you claim.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <Button data-testid="hero-get-started-btn" size="lg" onClick={openSignup}>
              Get Started Free
            </Button>
            <a href="#features">
              <Button data-testid="hero-explore-btn" variant="secondary" size="lg">
                Explore the Profitability Badge
              </Button>
            </a>
          </div>
        </div>

        <div className="relative min-w-[300px] flex-1 basis-[380px]">
          <div className="relative h-[340px] w-full overflow-hidden rounded-md">
            <img src="/assets/hero-truck.png" alt="Semi truck in motion on the open road" className="h-full w-full object-cover" />
          </div>
          <div className="absolute right-4 top-4 flex min-w-[108px] flex-col gap-1.5 rounded-md border border-white/40 bg-white/55 p-3 shadow-lg backdrop-blur-md">
            <span className="text-[10px] font-bold uppercase tracking-wide text-[#4A4438]">RPM Badge</span>
            <DemoTierBadge rpm={3.1} tier="green" />
            <DemoTierBadge rpm={2.35} tier="yellow" />
            <DemoTierBadge rpm={1.8} tier="red" />
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section id="features" className="mx-auto max-w-[1200px] px-8 pb-16 pt-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<svg width="24" height="24" viewBox="0 0 24 24" {...iconStroke}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></svg>}
            title="RPM Profitability Badge"
          >
            At-a-glance profitability intelligence. Know the actual worth of a load at selection.
          </FeatureCard>
          <FeatureCard
            icon={<svg width="24" height="24" viewBox="0 0 24 24" {...iconStroke}><rect x="4" y="2" width="16" height="20" rx="2" /><line x1="8" y1="6" x2="16" y2="6" /><line x1="8" y1="11" x2="9" y2="11" /><line x1="12" y1="11" x2="13" y2="11" /><line x1="16" y1="11" x2="17" y2="11" /><line x1="8" y1="15" x2="9" y2="15" /><line x1="12" y1="15" x2="13" y2="15" /><line x1="16" y1="15" x2="17" y2="15" /><line x1="8" y1="19" x2="9" y2="19" /><line x1="12" y1="19" x2="13" y2="19" /></svg>}
            title="Trucker Cost Profile Engine"
          >
            Model your fixed costs, MPG, fuel price, and target margin.
          </FeatureCard>
          <FeatureCard
            icon={<svg width="24" height="24" viewBox="0 0 24 24" {...iconStroke}><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></svg>}
            title="30-Day Earnings Insights"
          >
            View your performance history and make data-driven decisions.
          </FeatureCard>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-y border-[#D8CEB8] bg-white">
        <div className="mx-auto max-w-[1200px] px-8 py-16">
          <h2 className="mb-10 text-center text-xs font-bold uppercase tracking-[0.1em] text-shipper-text-muted">
            How It Works
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="flex flex-col items-center gap-4 text-center">
              <StepIcon>
                <svg width="28" height="28" viewBox="0 0 24 24" {...iconStroke}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
              </StepIcon>
              <h3 className="text-base font-bold text-shipper-text">1. Input your costs.</h3>
              <p className="text-sm text-shipper-text-muted">Enter your fixed and variable operating costs.</p>
            </div>
            <div className="flex flex-col items-center gap-4 text-center">
              <StepIcon>
                <svg width="28" height="28" viewBox="0 0 24 24" {...iconStroke}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              </StepIcon>
              <h3 className="text-base font-bold text-shipper-text">2. We analyze the load.</h3>
              <p className="text-sm text-shipper-text-muted">Our engine calculates true profitability per mile.</p>
            </div>
            <div className="flex flex-col items-center gap-4 text-center">
              <StepIcon>
                <svg width="28" height="28" viewBox="0 0 24 24" {...iconStroke}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
              </StepIcon>
              <h3 className="text-base font-bold text-shipper-text">3. See true profit.</h3>
              <p className="text-sm text-shipper-text-muted">Make informed decisions with clear profit visibility.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Persona split */}
      <section className="mx-auto max-w-[1200px] px-8 py-16">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-4 rounded-md border border-shipper-accent bg-shipper-surface p-6 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-shipper-accent">For Carriers</span>
            <h3 className="font-display text-2xl font-bold text-shipper-text">Find loads that actually pay.</h3>
            <p className="text-sm leading-relaxed text-shipper-text-muted">
              Set up your cost profile once. Every open load shows a color-coded RPM badge against your real numbers
              — no more guesswork at the board.
            </p>
          </div>
          <div className="flex flex-col gap-4 rounded-md border border-shipper-accent bg-shipper-surface p-6 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-shipper-accent">For Shippers</span>
            <h3 className="font-display text-2xl font-bold text-shipper-text">Post loads, reach owner-operators directly.</h3>
            <p className="text-sm leading-relaxed text-shipper-text-muted">
              Get your freight in front of carriers who claim loads because the math works for them — not because
              they had no better option.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section id="pricing" className="mx-auto max-w-[960px] px-8 pb-16">
        <h2 className="mb-8 text-center font-display text-3xl font-bold text-shipper-text">Why FreightClub</h2>
        <div className="overflow-x-auto rounded-md border border-shipper-accent bg-white shadow-sm">
          <table className="w-full min-w-[480px] border-collapse">
            <thead>
              <tr className="bg-shipper-accent">
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-white"></th>
                <th className="bg-[#7A5F3A] px-6 py-4 text-center text-xs font-bold uppercase tracking-wide text-white">Profitability-First</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wide text-white">Rate Data Only</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wide text-white">Acts as Broker</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-[#E8E3D8]">
                <td className="bg-[#FBF5E8] px-6 py-4 text-sm font-bold text-shipper-text">FreightClub</td>
                <td className="bg-[#FBF5E8] px-6 py-4 text-center">
                  <svg className="mx-auto" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8C6D3F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </td>
                <td className="px-6 py-4 text-center">
                  <svg className="mx-auto" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B91C1C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </td>
                <td className="px-6 py-4 text-center">
                  <svg className="mx-auto" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B91C1C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </td>
              </tr>
              {['Other Board 2', 'Other Board 3'].map((name) => (
                <tr key={name} className="border-t border-[#E8E3D8]">
                  <td className="px-6 py-4 text-sm font-medium text-shipper-text-muted">{name}</td>
                  {[0, 1, 2].map((i) => (
                    <td key={i} className="px-6 py-4 text-center">
                      <svg className="mx-auto" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B91C1C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-[960px] px-8 pb-16">
        <div className="flex flex-col items-center gap-4 rounded-md border border-shipper-accent bg-white p-12 text-center shadow-sm">
          <h2 className="font-display text-3xl font-bold text-shipper-text">
            Let's get your first load on the board in 2 minutes.
          </h2>
          <p className="max-w-[480px] text-sm text-shipper-text-muted">
            Set up your cost profile to see profitability ratings on loads.
          </p>
          <Button data-testid="final-cta-btn" size="lg" onClick={openSignup} className="mt-2">
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A1A1A] text-[#C9C1AF]">
        <div className="mx-auto max-w-[1200px] px-8 pb-8 pt-16">
          <div className="mb-8 grid grid-cols-2 gap-8 sm:grid-cols-5">
            <div className="col-span-2 flex min-w-[240px] flex-col gap-4">
              <img src="/assets/logo-mobile.png" alt="MDB" className="h-8 w-auto object-contain" />
              <p className="max-w-[320px] text-sm leading-relaxed text-[#8C8578]">
                Integrated Logistics solutions for modern carriers. Profitability-first technology.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="mb-1 text-xs font-bold uppercase tracking-wide text-white">Product</h4>
              <a href="#how-it-works" className="text-sm text-[#8C8578] hover:text-white">How It Works</a>
              <a href="#features" className="text-sm text-[#8C8578] hover:text-white">Technology</a>
              <a href="#pricing" className="text-sm text-[#8C8578] hover:text-white">Pricing</a>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="mb-1 text-xs font-bold uppercase tracking-wide text-white">Company</h4>
              <a href="#" className="text-sm text-[#8C8578] hover:text-white">Team</a>
              <a href="#" className="text-sm text-[#8C8578] hover:text-white">Privacy Policy</a>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="mb-1 text-xs font-bold uppercase tracking-wide text-white">Contact Us</h4>
              <span className="text-sm text-[#8C8578]">Mike Barnes</span>
              <a href="tel:+14049609621" className="text-sm text-[#8C8578] hover:text-white">(404) 960-9621</a>
              <a href="mailto:mike.barnes@mdbfreightclub.com" className="text-sm text-[#8C8578] hover:text-white">mike.barnes@mdbfreightclub.com</a>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="mb-1 text-xs font-bold uppercase tracking-wide text-white">Account</h4>
              <button type="button" data-testid="footer-login-btn" onClick={openLogin} className="text-left text-sm text-[#8C8578] hover:text-white">
                Log in
              </button>
            </div>
          </div>
          <div className="flex flex-wrap justify-between gap-2 border-t border-[#2A2A2A] pt-6 text-xs text-[#6B6558]">
            <span>© 2026 MDB Integrated Logistics</span>
            <span>FreightClub — profitability-first load board</span>
          </div>
        </div>
      </footer>

      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} onSwitchToSignup={switchToSignup} />
      <SignupModal isOpen={signupOpen} onClose={() => setSignupOpen(false)} onSwitchToLogin={switchToLogin} />
    </div>
  )
}
