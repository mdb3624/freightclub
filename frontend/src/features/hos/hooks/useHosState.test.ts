import { renderHook, act } from '@testing-library/react'
import { useHosState } from './useHosState'
import { useHosStore } from '@/store/hosStore'

describe('useHosState', () => {
  beforeEach(() => {
    useHosStore.setState({
      hoursDrivenToday: '',
      onDutyStartTime: '',
      dailyHours: Array(8).fill(0),
    })
  })

  it('returns state from store', () => {
    const { result } = renderHook(() => useHosState())
    const [state] = result.current
    expect(state.hoursDrivenToday).toBe('')
    expect(state.onDutyStartTime).toBe('')
    expect(state.dailyHours).toHaveLength(8)
  })

  it('returns setState function as second element', () => {
    const { result } = renderHook(() => useHosState())
    const [, setState] = result.current
    expect(typeof setState).toBe('function')
  })

  it('updates state with object updater', () => {
    const { result } = renderHook(() => useHosState())
    act(() => {
      const [, setState] = result.current
      setState({ hoursDrivenToday: '8.5' })
    })
    const [state] = result.current
    expect(state.hoursDrivenToday).toBe('8.5')
  })

  it('updates state with function updater', () => {
    const { result } = renderHook(() => useHosState())
    act(() => {
      const [, setState] = result.current
      setState((prev) => ({
        ...prev,
        hoursDrivenToday: '9.0',
      }))
    })
    const [state] = result.current
    expect(state.hoursDrivenToday).toBe('9.0')
  })

  it('maintains state across hook calls', () => {
    const { result: result1 } = renderHook(() => useHosState())
    const { result: result2 } = renderHook(() => useHosState())

    act(() => {
      const [, setState] = result1.current
      setState({ hoursDrivenToday: '7.5' })
    })

    const [state2] = result2.current
    expect(state2.hoursDrivenToday).toBe('7.5')
  })

  it('returns readonly tuple type', () => {
    const { result } = renderHook(() => useHosState())
    const tuple = result.current
    expect(Array.isArray(tuple)).toBe(true)
    expect(tuple).toHaveLength(2)
  })
})
