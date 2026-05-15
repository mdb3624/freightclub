import { renderHook, act } from '@testing-library/react'
import { useHosStore } from './hosStore'

describe('hosStore', () => {
  beforeEach(() => {
    // Reset store to default state before each test
    useHosStore.setState({
      hoursDrivenToday: '',
      onDutyStartTime: '',
      dailyHours: Array(8).fill(0),
    })
  })

  it('initializes with default state', () => {
    const { result } = renderHook(() => useHosStore())
    expect(result.current.hoursDrivenToday).toBe('')
    expect(result.current.onDutyStartTime).toBe('')
    expect(result.current.dailyHours).toHaveLength(8)
    expect(result.current.dailyHours).toEqual([0, 0, 0, 0, 0, 0, 0, 0])
  })

  it('updates hoursDrivenToday', () => {
    const { result } = renderHook(() => useHosStore())
    act(() => {
      result.current.setHoursDrivenToday('8.5')
    })
    expect(result.current.hoursDrivenToday).toBe('8.5')
  })

  it('updates onDutyStartTime', () => {
    const { result } = renderHook(() => useHosStore())
    act(() => {
      result.current.setOnDutyStartTime('08:00 AM')
    })
    expect(result.current.onDutyStartTime).toBe('08:00 AM')
  })

  it('updates dailyHours array', () => {
    const { result } = renderHook(() => useHosStore())
    const newHours = [8, 7, 9, 6, 8, 7, 10, 5]
    act(() => {
      result.current.setDailyHours(newHours)
    })
    expect(result.current.dailyHours).toEqual(newHours)
  })

  it('resets state to defaults', () => {
    const { result } = renderHook(() => useHosStore())
    act(() => {
      result.current.setHoursDrivenToday('8.5')
      result.current.setOnDutyStartTime('08:00 AM')
      result.current.setDailyHours([8, 7, 9, 6, 8, 7, 10, 5])
    })
    act(() => {
      result.current.resetHosState()
    })
    expect(result.current.hoursDrivenToday).toBe('')
    expect(result.current.onDutyStartTime).toBe('')
    expect(result.current.dailyHours).toEqual([0, 0, 0, 0, 0, 0, 0, 0])
  })

  it('maintains state across multiple renders', () => {
    const { result, rerender } = renderHook(() => useHosStore())
    act(() => {
      result.current.setHoursDrivenToday('7.5')
    })
    rerender()
    expect(result.current.hoursDrivenToday).toBe('7.5')
  })
})
