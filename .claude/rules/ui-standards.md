# FreightClub UI & Frontend Standards

## 🏗️ Feature-Sliced Architecture
- **Location:** Organize by feature (e.g., `src/features/loads/`) rather than technical layer.
- **Components:** Keep UI atoms in `src/components/ui/` and complex feature logic in `src/features/{name}/components/`.

## 🔐 Security & State
- **Auth Tokens:** Store `accessToken` ONLY in Zustand in-memory state. Never persist to `localStorage`.
- **Refresh Flow:** Rely on the HTTP-only refresh cookie for session persistence.
- **Zod Validation:** Every form must have a corresponding Zod schema for type-safe validation.

## 📡 Data Fetching (React Query)
- **Hooks:** Wrap all API calls in custom hooks (e.g., `useLoadBoard`).
- **Error Boundaries:** Use the global `ErrorBoundary` in `App.tsx` for component-level resilience.
- **Proxy Usage:** All API calls must use relative paths (e.g., `/api/v1/...`) to work with the Vite proxy.

## 🎨 Styling (Tailwind CSS)
- **Consistency:** Use Tailwind utility classes; avoid inline styles.
- **Badges:** Use the established RPM color-coding: Green (High Profit), Yellow (Neutral), Red (Low Profit).
- **3D Gradient Exception:** When the design spec requires a metallic bevel/gradient (e.g., Shipper bronze CTA buttons), use inline `style` — Tailwind cannot express arbitrary gradient stops. Standard `bronzeButtonStyle` pattern:
  ```ts
  const bronzeButtonStyle: React.CSSProperties = {
    background: 'linear-gradient(180deg, #C9A46A 0%, #B08D57 45%, #8C6D3F 100%)',
    boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.25), inset 0 -1px 2px rgba(0,0,0,0.2), 0 2px 5px rgba(0,0,0,0.35)',
    border: '1px solid #7A5F3A',
  }
  ```

## 🖼️ Shipper Persona Panel Borders
- All Shipper dashboard panels use `border-shipper-accent` (metallic bronze `#B08D57`), NOT `border-shipper-border` (grey). The `surfaceClassName` token from `PersonaThemeContext` uses grey — override explicitly on Shipper dashboard components.
- Panel class pattern: `rounded-md border border-shipper-accent bg-shipper-surface shadow-md`

## 🔐 Shipper Header Navigation Pattern
- Shipper persona: NO text nav links in the header (My Loads, Profile removed). Only logo + notification bell + circular avatar badge.
- Profile + Sign out live in a dropdown off the avatar badge (`aria-haspopup="true"`, `role="menu"`).
- "My Loads" must be placed in the dashboard body as a bronze gradient button/link, NOT in the header.
- Carrier persona: keeps standard nav links (Load Board, My Ratings) — this pattern is shipper-only.

## 📋 Locked HFD Spec Authority
- The locked HFD design spec (e.g., `docs/hfd/US-760_SHIPPER_DASHBOARD_OVERHAUL_DESIGN_SPEC.md`) is the authoritative implementation contract.
- HFE audit gap analysis docs (`HFE_AUDIT_US760_GAP_ANALYSIS.md`) are secondary; when values conflict, the locked spec wins.
- Style Guide design principles (e.g., "Persistent Redundancy Framework") describe philosophy; the locked spec defines what is actually built.
