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
