import { create } from 'zustand'

export interface HosState {
  hoursDrivenToday: string
  onDutyStartTime: string
  dailyHours: number[] // index 0 = today, index 7 = 7 days ago
}

interface HosStore extends HosState {
  setHoursDrivenToday: (hours: string) => void
  setOnDutyStartTime: (time: string) => void
  setDailyHours: (hours: number[]) => void
  resetHosState: () => void
}

const DAILY_HOURS_LENGTH = 8
const defaultState: HosState = {
  hoursDrivenToday: '',
  onDutyStartTime: '',
  dailyHours: Array(DAILY_HOURS_LENGTH).fill(0),
}

export const useHosStore = create<HosStore>((set) => ({
  ...defaultState,

  setHoursDrivenToday: (hoursDrivenToday) => set({ hoursDrivenToday }),

  setOnDutyStartTime: (onDutyStartTime) => set({ onDutyStartTime }),

  setDailyHours: (dailyHours) => set({ dailyHours }),

  resetHosState: () => set(defaultState),
}))
