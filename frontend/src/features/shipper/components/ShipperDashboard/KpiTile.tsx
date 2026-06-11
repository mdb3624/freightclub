import { usePersonaTheme } from '@/contexts/PersonaThemeContext'

interface KpiTileProps {
  testId: string
  label: string
  value: string | number
  unit?: string
  trend?: string
}

export function KpiTile({ testId, label, value, unit, trend }: KpiTileProps) {
  const { headingClassName, mutedClassName } = usePersonaTheme()
  const displayValue = unit === '%' ? `${value}${unit}` : unit ? `${unit}${value}` : `${value}`

  return (
    <div
      data-testid={testId}
      role="group"
      aria-label={`${label}: ${displayValue}`}
      className="p-4 rounded-md border border-shipper-accent bg-shipper-surface shadow-md"
    >
      <p className={`text-xs uppercase tracking-widest font-semibold ${mutedClassName}`}>{label}</p>
      <p className={`text-3xl font-bold mt-1 ${headingClassName}`}>{displayValue}</p>
      {trend && <span className="inline-block mt-1 text-xs rounded-full px-2 py-0.5 bg-shipper-accent/10 text-shipper-accent">{trend}</span>}
    </div>
  )
}
