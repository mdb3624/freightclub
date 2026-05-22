import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // ─── Brand tokens (docs/standards/brand_assets/STYLE_GUIDE.md) ──────────
      colors: {
        // Existing primary scale — kept for backwards compatibility.
        // Kinetic Blue (#2563EB) === primary-600.
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },

        // ── Brand palette ───────────────────────────────────────────────────
        'surface-dark':   '#0B1220', // Deep Space Navy — dashboard backgrounds
        'kinetic-blue':   '#2563EB', // Primary buttons, links (alias for primary-600)
        'secondary-blue': '#00D4FF', // Accent highlights, gradients
        'accent-teal':    '#00E5A8', // Growth indicators, profit/success highlights

        // ── Neutral scale ───────────────────────────────────────────────────
        'steel-grey': '#1E293B',     // Sidebars, card backgrounds
        'mid-grey':   '#334155',     // Borders, secondary text

        // ── Semantic tokens ─────────────────────────────────────────────────
        // Use these on badges, banners, and status indicators instead of
        // raw Tailwind colour names (green-*, amber-*, red-*).
        success: {
          DEFAULT: '#22C55E',
          subtle:  '#DCFCE7', // green-100 equivalent
          text:    '#15803D', // green-700 equivalent — legible on subtle bg
        },
        warning: {
          DEFAULT: '#F59E0B',
          subtle:  '#FEF3C7', // amber-100 equivalent
          text:    '#B45309', // amber-700 equivalent
        },
        error: {
          DEFAULT: '#EF4444',
          subtle:  '#FEE2E2', // red-100 equivalent
          text:    '#B91C1C', // red-700 equivalent
        },
        info: {
          DEFAULT: '#2563EB',
          subtle:  '#DBEAFE', // blue-100 equivalent
          text:    '#1D4ED8', // blue-700 equivalent
        },

        // ── RPM profit bands (ui-standards.md) ──────────────────────────────
        // These replace ad hoc green/yellow/red utility classes on load cards.
        'rpm-high':    '#22C55E', // High profit  — green
        'rpm-neutral': '#F59E0B', // Neutral       — yellow
        'rpm-low':     '#EF4444', // Low profit   — red

        // Existing accent scale — kept for backwards compatibility.
        accent: {
          500: '#f97316',
          600: '#ea580c',
        },
      },

      // ─── Typography (docs/standards/brand_assets/STYLE_GUIDE.md) ──────────────
      // Add SORA (headlines) and INTER (body/UI) — install via Google Fonts or
      // npm packages (@fontsource/sora, @fontsource/inter) and import in main.tsx.
      fontFamily: {
        sans:     ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display:  ['Sora', 'Inter', 'ui-sans-serif', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
