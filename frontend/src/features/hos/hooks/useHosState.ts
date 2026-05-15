import { useHosStore, type HosState } from '@/store/hosStore'

export function useHosState() {
  const state = useHosStore((store) => ({
    hoursDrivenToday: store.hoursDrivenToday,
    onDutyStartTime: store.onDutyStartTime,
    dailyHours: store.dailyHours,
  }))

  const setState = (updater: HosState | ((prev: HosState) => HosState)) => {
    if (typeof updater === 'function') {
      const newState = updater(state)
      useHosStore.setState(newState)
    } else {
      useHosStore.setState(updater)
    }
  }

  return [state, setState] as const
}
