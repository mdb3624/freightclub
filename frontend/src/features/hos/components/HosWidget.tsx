import { useState } from 'react'
import { useHosState } from '../hooks/useHosState'

const DAY_LABELS = [
  'Today',
  'Yesterday',
  '2 days ago',
  '3 days ago',
  '4 days ago',
  '5 days ago',
  '6 days ago',
  '7 days ago',
]

interface Thresholds {
  amber: number
  red: number
}

function barColor(remaining: number, max: number, thresholds?: Thresholds): string {
  if (thresholds) {
    if (remaining <= thresholds.red) return 'bg-red-500'
    if (remaining <= thresholds.amber) return 'bg-amber-400'
    return 'bg-green-500'
  }
  const pct = remaining / max
  if (pct < 0.15) return 'bg-red-500'
  if (pct < 0.30) return 'bg-amber-400'
  return 'bg-green-500'
}

function textColor(remaining: number, max: number, thresholds?: Thresholds): string {
  if (thresholds) {
    if (remaining <= thresholds.red) return 'text-red-700'
    if (remaining <= thresholds.amber) return 'text-amber-700'
    return 'text-green-700'
  }
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
  thresholds?: Thresholds
  notStarted?: boolean
}

function HosBar({ label, remaining, max, rule, thresholds, notStarted }: HosBarProps) {
  const pct = Math.min(100, (remaining / max) * 100)
  const tc = textColor(remaining, max, thresholds)
  const exhausted = remaining <= 0

  if (notStarted) {
    return (
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-600">{label} <span className="text-gray-400">({rule})</span></span>
          <span className="font-semibold text-gray-400">Not started</span>
        </div>
        <div className="h-2 rounded-full bg-gray-100" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600">{label} <span className="text-gray-400">({rule})</span></span>
        <span className={`font-semibold ${exhausted ? 'text-red-700' : tc}`}>
          {exhausted ? 'Limit reached' : `${remaining.toFixed(1)} hr left`}
        </span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${exhausted ? 'bg-gray-300' : barColor(remaining, max, thresholds)}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {!exhausted && remaining <= 0.5 && (
        <p className={`mt-1 text-xs font-medium text-red-700`}>
          30 minutes remaining — find a safe stop immediately.
        </p>
      )}
      {!exhausted && remaining > 0.5 && remaining < 2 && (
        <p className={`mt-1 text-xs font-medium ${tc}`}>
          Under 2 hours remaining — stop soon.
        </p>
      )}
      {!exhausted && remaining >= 2 && remaining < 4 && (
        <p className={`mt-1 text-xs font-medium ${tc}`}>
          Under 4 hours remaining — plan your next stop.
        </p>
      )}
    </div>
  )
}

export function HosWidget() {
  const [hos, setHos] = useHosState()
  const [cycleExpanded, setCycleExpanded] = useState(false)

  const driveNotStarted = hos.hoursDrivenToday === '' || hos.hoursDrivenToday === undefined
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

  const totalOnDuty = hos.dailyHours.reduce((a, b) => a + b, 0)
  const remaining70hr = Math.max(0, 70 - totalOnDuty)
  const cycleExhausted = remaining70hr === 0

  function setDayHours(index: number, value: number) {
    setHos((s) => {
      const updated = [...s.dailyHours]
      updated[index] = Math.min(24, Math.max(0, isFinite(value) ? value : 0))
      return { ...s, dailyHours: updated }
    })
  }

  function handle34hrRestart() {
    setHos((s) => ({ ...s, dailyHours: Array(8).fill(0) }))
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Hours of Service
        </h3>
        <span className="text-xs text-gray-400">FMCSA 11/14-hr · 70-hr/8-day</span>
      </div>

      {/* Per-shift inputs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
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
            placeholder="Enter start time"
          />
          {!hos.onDutyStartTime && (
            <p className="mt-0.5 text-xs text-gray-400">Enter start time to track the 14-hr window.</p>
          )}
        </div>
      </div>

      {/* 70-hr / 8-day cycle log */}
      <div className="mb-4 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
        <button
          type="button"
          className="flex w-full items-center justify-between text-left"
          onClick={() => setCycleExpanded((v) => !v)}
          aria-expanded={cycleExpanded}
        >
          <span className="text-xs font-medium text-gray-700">
            70-hr / 8-day on-duty log
          </span>
          <span className={`text-xs font-semibold ${cycleExhausted ? 'text-red-700' : remaining70hr <= 14 ? 'text-amber-700' : 'text-green-700'}`}>
            {totalOnDuty.toFixed(1)} / 70 hrs used
            <span className="ml-1 text-gray-400 font-normal">{cycleExpanded ? '▲' : '▼'}</span>
          </span>
        </button>

        {cycleExpanded && (
          <div className="mt-3 space-y-2">
            {DAY_LABELS.map((label, i) => (
              <div key={label} className="flex items-center gap-3">
                <span className="w-24 text-xs text-gray-500 shrink-0">{label}</span>
                <input
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={hos.dailyHours[i] === 0 ? '' : hos.dailyHours[i]}
                  onChange={(e) => setDayHours(i, parseFloat(e.target.value))}
                  placeholder="0"
                />
                <span className="text-xs text-gray-400">hrs on-duty</span>
              </div>
            ))}
            <div className="pt-2 flex items-center justify-between border-t border-gray-200 mt-2">
              <span className="text-xs text-gray-600">
                Total: <strong>{totalOnDuty.toFixed(1)} hrs</strong> of 70
              </span>
              <button
                type="button"
                className="text-xs text-gray-500 hover:text-red-600 underline"
                onClick={handle34hrRestart}
              >
                34-hr restart (reset cycle)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* HOS bars */}
      <div className="space-y-3">
        <HosBar label="Drive Time" remaining={remainingDrive} max={11} rule="11-hr" notStarted={driveNotStarted} />

        {remainingOnDuty !== null ? (
          <HosBar label="On-Duty Window" remaining={remainingOnDuty} max={14} rule="14-hr" />
        ) : (
          <HosBar label="On-Duty Window" remaining={14} max={14} rule="14-hr" notStarted />
        )}

        <HosBar
          label="Weekly Cycle"
          remaining={remaining70hr}
          max={70}
          rule="70-hr/8-day"
          thresholds={{ amber: 14, red: 2 }}
        />
      </div>

      {/* 70-hr exhaustion warning */}
      {cycleExhausted && (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2">
          <p className="text-sm font-semibold text-red-700">
            You have exhausted your 70-hour cycle.
          </p>
          <p className="text-xs text-red-600 mt-0.5">
            You must take a 34-hour restart before driving. Use the reset button in the log above once your restart is complete.
          </p>
        </div>
      )}
    </div>
  )
}
