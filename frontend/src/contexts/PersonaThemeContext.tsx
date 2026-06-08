import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { useAuthStore } from '@/store/authStore'

/**
 * CHG-705: Persona-Aware UI Correction
 *
 * Carrier persona (TRUCKER role, mobile "Luxury Industrial" dark mode):
 *   docs/standards/brand_assets/Carrier Style Guide.md
 * Shipper persona (SHIPPER/ADMIN roles, desktop "Classic Cream & Metallic Bronze"):
 *   docs/standards/brand_assets/Shipper & Administrator Style Guide.md
 *
 * IMPORTANT: index.css carries a global legacy dark-theme stylesheet that
 * applies `!important` overrides to .bg-white, .bg-gray-*, .text-gray-*, and
 * .border-gray-* on every page. Persona surface/text/border classes below
 * intentionally use the custom-named `carrier-*` / `shipper-*` Tailwind
 * tokens (see tailwind.config.ts) so they bypass those legacy selectors —
 * using bg-white/text-gray-900/etc. here would be silently overridden.
 */
export type Persona = 'carrier' | 'shipper'
export type SurfaceShape = 'pill' | 'framed'

export interface PersonaTokens {
  persona: Persona
  backgroundClassName: string
  surfaceShape: SurfaceShape
  /** Tailwind classes for cards/panels per the persona's surface shape. */
  surfaceClassName: string
  /** Tailwind classes for buttons/interactive controls per the persona's surface shape. */
  controlClassName: string
  /** Heading/primary text color. */
  headingClassName: string
  /** Body/primary label text color. */
  textClassName: string
  /** Secondary/muted text color. */
  mutedClassName: string
}

const CARRIER_TOKENS: PersonaTokens = {
  persona: 'carrier',
  backgroundClassName: 'bg-carrier-bg text-carrier-text',
  surfaceShape: 'pill',
  surfaceClassName: 'rounded-3xl border border-carrier-border bg-carrier-surface shadow-lg',
  controlClassName: 'rounded-full',
  headingClassName: 'text-carrier-text',
  textClassName: 'text-carrier-text',
  mutedClassName: 'text-carrier-text-muted',
}

const SHIPPER_TOKENS: PersonaTokens = {
  persona: 'shipper',
  backgroundClassName: 'bg-shipper-bg text-shipper-text',
  surfaceShape: 'framed',
  surfaceClassName: 'rounded-md border border-shipper-border bg-shipper-surface shadow-sm',
  controlClassName: 'rounded-md',
  headingClassName: 'text-shipper-text',
  textClassName: 'text-shipper-text',
  mutedClassName: 'text-shipper-text-muted',
}

function tokensForRole(role: string | undefined): PersonaTokens {
  return role === 'TRUCKER' ? CARRIER_TOKENS : SHIPPER_TOKENS
}

const PersonaThemeContext = createContext<PersonaTokens>(SHIPPER_TOKENS)

export function PersonaThemeProvider({ children }: { children: ReactNode }) {
  const role = useAuthStore((s) => s.user?.role)
  const tokens = useMemo(() => tokensForRole(role), [role])

  useEffect(() => {
    document.documentElement.dataset.persona = tokens.persona
  }, [tokens.persona])

  return (
    <PersonaThemeContext.Provider value={tokens}>
      <div data-testid="persona-theme-root" data-persona={tokens.persona} className={tokens.backgroundClassName}>
        {children}
      </div>
    </PersonaThemeContext.Provider>
  )
}

export function usePersonaTheme(): PersonaTokens {
  return useContext(PersonaThemeContext)
}
