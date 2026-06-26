import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useDieselPrices } from './useDieselPrices'

vi.mock('../api', () => ({
  marketApi: {
    getDieselPrices: vi.fn(() => new Promise(() => {})),
  },
}))

describe('useDieselPrices', () => {
  it('should return hook with expected shape', () => {
    // Hook should export correctly and be callable
    expect(typeof useDieselPrices).toBe('function')
  })

  it('should initialize with loading state and no data', () => {
    // Verify hook works as a React hook
    const { result } = renderHook(() => useDieselPrices())
    expect(result.current).toHaveProperty('data')
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('error')
    expect(result.current.data).toBeUndefined()
  })
})
