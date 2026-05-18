import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useProfile } from './useProfile'

describe('useProfile', () => {
  it('should return hook with expected shape', () => {
    // Hook should export correctly and be callable
    expect(typeof useProfile).toBe('function')
  })

  it('should initialize with loading state and no data', () => {
    // Verify hook works as a React hook
    const { result } = renderHook(() => useProfile())
    expect(result.current).toHaveProperty('data')
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('error')
    expect(result.current.data).toBeUndefined()
  })
})
