import { useHosState } from '../hooks/useHosState'

function barColor(remaining: number, max: number): string {
  const pct = remaining / max
  if (pct < 0.15) return 'bg-red-500'
  if (pct < 0.30) return 'bg-amber-400'
  return 'bg-green-500'
}

function textColor(remaining: number, max: number): string {
  const pct = remaining / max
  if (pct < 0.15) return 'text-red-700'
  if (pct < 0.30) return 'text-amber-700'
  return 'text-green-700'
}

interface HosBarProps {
  label: string
  remaining: number
  max: number
  rule: string
}

function HosBar({ label, remaining, max, rule }: HosBarProps) {
  const pct = Math.min(100, (remaining / max) * 100)
  const tc = textColor(remaining, max)
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600">{label} <span className="text-gray-400">({rule})</span></span>
        <span className={`font-semibold ${tc}`}>{remaining.toFixed(1)} hr left</span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor(remaining, max)}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {remaining < 2 && (
        <p className={`mt-1 text-xs font-medium ${tc}`}>
          Under 2 hours remaining — plan your stop now.
        </p>
      )}
    </div>
  )
}

export function HosWidget() {
  const [hos, setHos] = useHosState()

  const hoursDriven = parseFloat(hos.hoursDrivenToday) || 0
  const remainingDrive = Math.max(0, 11 - hoursDriven)

  let remainingOnDuty: number | null = null
  if (hos.onDutyStartTime) {
    const [h, m] = hos.onDutyStartTime.split(':').map(Number)
    const start = new Date()
    start.setHours(h, m, 0, 0)
    const windowEnd = new Date(start.getTime() + 14 * 60 * 60 * 1000)
    remainingOnDuty = Math.max(0, (windowEnd.getTime() - Date.now()) / (1000 * 60 * 60))
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Hours of Service
        </h3>
        <span className="text-xs text-gray-400">FMCSA 11/14-hr rules</span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Hours Driven Today
          </label>
          <input
            type="number"
            min="0"
            max="11"
            step="0.5"
            className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={hos.hoursDrivenToday}
            onChange={(e) => setHos((s) => ({ ...s, hoursDrivenToday: e.target.value }))}
            placeholder="e.g. 4.5"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            On-Duty Start Time (today)
          </label>
          <input
            type="time"
            className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={hos.onDutyStartTime}
            onChange={(e) => setHos((s) => ({ ...s, onDutyStartTime: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-3">
        <HosBar label="Drive Time" remaining={remainingDrive} max={11} rule="11-hr" />
        {remainingOnDuty !== null && (
          <HosBar label="On-Duty Window" remaining={remainingOnDuty} max={14} rule="14-hr" />
        )}
      </div>
    </div>
  )
}
