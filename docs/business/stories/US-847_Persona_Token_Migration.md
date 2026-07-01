# US-847: Persona Token Migration (optional)

**Story ID:** US-847
**Jira:** FREIG-78
**Phase:** v0.1.0 Design System Integration (Phase 8 — optional)
**Status:** TO DO
**Scope:** FRONTEND
**Effort:** 1.5 days
**Priority:** P2 (optional — implement after Phases 1–7 complete)

---

## User Story

**As a** developer building new FreightClub pages
**I want** persona-specific styles driven by CSS custom properties (`var(--p-surface)`) rather than className strings from `usePersonaTheme()`
**So that** every new component just uses CSS variables with zero conditional logic

---

## Acceptance Criteria

### AC-1: data-persona attribute wired (Playbook 8A)
```gherkin
Given PersonaThemeProvider wraps the app
When this phase is complete
Then the provider's root element has data-persona={persona} (value: 'shipper' or 'carrier')
  And Prototype/tokens/colors.css [data-persona] selectors activate automatically
  And persona detection logic is unchanged
  And usePersonaTheme() is not yet deprecated
```

### AC-2: AppShell migrated to CSS tokens (Playbook 8B)
```gherkin
Given AppShell uses backgroundClassName / surfaceClassName strings
When this phase is complete
Then header background uses var(--p-header-bg), border uses var(--p-header-border), height uses var(--p-header-height)
  And avatar ring/bg/text use var(--p-avatar-ring/bg/text)
  And routing, navigation, and layout logic are unchanged
```

### AC-3: Button migrated to CSS tokens (Playbook 8C)
```gherkin
Given Button uses usePersonaTheme() actionClassName for border-radius
When this phase is complete
Then Button uses a 'persona' prop (default 'shipper') for border-radius (4px vs 8px)
  And usePersonaTheme() import is removed from Button.tsx
  And ButtonProps interface and all other logic are unchanged
```

### AC-4: usePersonaTheme className strings deprecated (Playbook 8D)
```gherkin
Given backgroundClassName, surfaceClassName, actionClassName, shapeClassName exist in PersonaThemeContext
When this phase is complete
Then those className string properties are removed from the hook/context
  And persona, isCarrier, isShipper boolean/string values are kept
  And all former usages across frontend/src/ are migrated to CSS custom properties
  And both personas render correctly with zero missing styles
```

---

## Source of Truth

- `Prototype/tokens/colors.css` ([data-persona="shipper"] and [data-persona="carrier"] blocks)
- Target: `frontend/src/contexts/PersonaThemeContext.tsx`, `frontend/src/components/AppShell.tsx`, `frontend/src/components/ui/Button.tsx`

---

## Playwright Verification

Spec: `frontend/e2e/design-system/US-847-persona-tokens.spec.ts`

- Both personas render correctly — `toHaveScreenshot` regression check
- `page.evaluate()`: confirm `document.querySelector('[data-persona]')` exists
- Adversarial: rapid persona switch shipper→carrier→shipper — no style residue
- Adversarial: assert `usePersonaTheme()` still exports `persona`, `isCarrier`, `isShipper`

---

## BA Sign-Off

- [x] Story ID: US-847
- [x] ACs measurable and testable
- [x] Source of truth: Prototype/tokens/colors.css [data-persona] blocks
- [x] Scope: FRONTEND — no routing or data changes
- [x] Depends on US-842 (Phase 3 must be complete first)
- [x] OPTIONAL: do not block v0.1.0 release on this story

**BA Status:** ✅ READY FOR IMPLEMENTATION (after US-846)
