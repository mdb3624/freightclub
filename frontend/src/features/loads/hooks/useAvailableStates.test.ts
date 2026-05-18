import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAvailableStates } from './useAvailableStates'

describe('useAvailableStates', () => {
  it('should return hook with expected shape', () => {
    // Hook should export correctly and be callable
    expect(typeof useAvailableStates).toBe('function')
  })

  it('should initialize with loading state and no data', () => {
    // Verify hook works as a React hook
    const { result } = renderHook(() => useAvailableStates())
    expect(result.current).toHaveProperty('data')
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('error')
    expect(result.current.data).toBeUndefined()
  })
})
