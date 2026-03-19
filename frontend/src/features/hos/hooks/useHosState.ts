import { useState, useEffect } from 'react'

export interface HosState {
  hoursDrivenToday: string
  onDutyStartTime: string
}

const STORAGE_KEY = 'fc_hos_state'
const defaultState: HosState = { hoursDrivenToday: '', onDutyStartTime: '' }

export function useHosState() {
  const [state, setState] = useState<HosState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as HosState) : defaultState
    } catch {
      return defaultState
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  return [state, setState] as const
}
