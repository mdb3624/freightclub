import { useState, useEffect } from 'react'

export interface HosState {
  hoursDrivenToday: string
  onDutyStartTime: string
  // On-duty hours per day: index 0 = today, index 7 = 7 days ago
  dailyHours: number[]
}

const DAILY_HOURS_LENGTH = 8
const STORAGE_KEY = 'fc_hos_state'
const defaultState: HosState = {
  hoursDrivenToday: '',
  onDutyStartTime: '',
  dailyHours: Array(DAILY_HOURS_LENGTH).fill(0),
}

export function useHosState() {
  const [state, setState] = useState<HosState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return defaultState
      const parsed = JSON.parse(raw) as Partial<HosState> & { hoursLast8Days?: string }

      // Migrate old single-field format to per-day array
      let dailyHours = Array(DAILY_HOURS_LENGTH).fill(0) as number[]
      if (Array.isArray(parsed.dailyHours) && parsed.dailyHours.length === DAILY_HOURS_LENGTH) {
        dailyHours = parsed.dailyHours.map((h) => (typeof h === 'number' && isFinite(h) ? h : 0))
      } else if (parsed.hoursLast8Days) {
        // Old format: spread the aggregate across all days evenly as a best-effort migration
        const total = parseFloat(parsed.hoursLast8Days) || 0
        dailyHours = dailyHours.map((_, i) => (i === 0 ? total : 0))
      }

      return {
        hoursDrivenToday: parsed.hoursDrivenToday ?? '',
        onDutyStartTime: parsed.onDutyStartTime ?? '',
        dailyHours,
      }
    } catch {
      return defaultState
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  return [state, setState] as const
}
