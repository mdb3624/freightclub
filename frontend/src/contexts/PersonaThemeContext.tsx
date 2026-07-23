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
  /** Corner radius for buttons/controls — pill (rounded-3xl) for Carrier, framed (rounded-md) for Shipper. */
  shapeClassName: string
  /** Background/text/hover classes for primary CTA buttons — copper (Carrier) vs. bronze (Shipper) accent. */
  actionClassName: string
  /** Background/border/text/hover classes for secondary (outlined) buttons — persona surface, not the accent color. */
  secondaryActionClassName: string
  /** Page-content width — narrow & centered for Carrier's mobile-first layout, full-width dense for Shipper's desktop data tables. */
  contentWidthClassName: string
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
  shapeClassName: 'rounded-3xl',
  actionClassName: 'bg-carrier-accent text-carrier-bg hover:opacity-90 focus:ring-carrier-accent',
  secondaryActionClassName: 'bg-carrier-surface border border-carrier-border text-carrier-text hover:opacity-90 focus:ring-carrier-accent',
  contentWidthClassName: 'max-w-md mx-auto',
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
  shapeClassName: 'rounded-md',
  actionClassName: 'bg-shipper-accent text-white hover:opacity-90 focus:ring-shipper-accent',
  secondaryActionClassName: 'bg-shipper-surface border border-shipper-border text-shipper-text hover:opacity-90 focus:ring-shipper-accent',
  contentWidthClassName: 'max-w-full',
  headingClassName: 'text-shipper-text',
  textClassName: 'text-shipper-text',
  mutedClassName: 'text-shipper-text-muted',
}

function tokensForRole(role: string | undefined): PersonaTokens {
  return role === 'TRUCKER' ? CARRIER_TOKENS : SHIPPER_TOKENS
}

/**
 * Looks up the full token set for an explicit persona, independent of the
 * ambient PersonaThemeProvider context. Needed by components (e.g. Button)
 * that accept a `persona` override prop — usePersonaTheme() alone only
 * reflects the surrounding page's context, not a per-instance override.
 */
// eslint-disable-next-line react-refresh/only-export-components -- intentional: helper colocated with its provider
export function getPersonaTokens(persona: Persona): PersonaTokens {
  return persona === 'carrier' ? CARRIER_TOKENS : SHIPPER_TOKENS
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

// eslint-disable-next-line react-refresh/only-export-components -- intentional: hook colocated with its provider
export function usePersonaTheme(): PersonaTokens {
  return useContext(PersonaThemeContext)
}
