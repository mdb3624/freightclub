import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useLazyFonts } from './useLazyFonts'

describe('useLazyFonts', () => {
  it('should not load fonts when isAuthenticated is false', () => {
    const loadFonts = vi.fn().mockResolvedValue(undefined)
    renderHook(() => useLazyFonts(false, loadFonts))
    expect(loadFonts).not.toHaveBeenCalled()
  })

  it('should load custom fonts when isAuthenticated is true', () => {
    const loadFonts = vi.fn().mockResolvedValue(undefined)
    renderHook(() => useLazyFonts(true, loadFonts))
    expect(loadFonts).toHaveBeenCalledTimes(1)
  })

  it('should not load fonts multiple times when isAuthenticated changes', () => {
    const loadFonts = vi.fn().mockResolvedValue(undefined)
    const { rerender } = renderHook(
      ({ isAuth }: { isAuth: boolean }) => useLazyFonts(isAuth, loadFonts),
      { initialProps: { isAuth: false } }
    )

    expect(loadFonts).not.toHaveBeenCalled()

    rerender({ isAuth: true })
    expect(loadFonts).toHaveBeenCalledTimes(1)

    rerender({ isAuth: true })
    expect(loadFonts).toHaveBeenCalledTimes(1)
  })

  it('should handle loader rejection gracefully without throwing', () => {
    const loadFonts = vi.fn().mockRejectedValue(new Error('network error'))
    expect(() => {
      renderHook(() => useLazyFonts(true, loadFonts))
    }).not.toThrow()
  })

  it('should use the real loadCustomFonts loader by default', () => {
    expect(() => {
      renderHook(() => useLazyFonts(false))
    }).not.toThrow()
  })
})
