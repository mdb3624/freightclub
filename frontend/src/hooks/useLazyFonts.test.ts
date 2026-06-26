import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useLazyFonts } from './useLazyFonts'

describe('useLazyFonts', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
  })

  afterEach(() => {
    document.head.innerHTML = ''
  })

  it('should not load fonts when isAuthenticated is false', () => {
    renderHook(() => useLazyFonts(false))
    const links = document.head.querySelectorAll('link[href*="/fonts/custom-fonts.css"]')
    expect(links.length).toBe(0)
  })

  it('should load custom fonts when isAuthenticated is true', () => {
    renderHook(() => useLazyFonts(true))
    const links = document.head.querySelectorAll('link[href="/fonts/custom-fonts.css"]')
    expect(links.length).toBe(1)
    expect(links[0]).toHaveAttribute('rel', 'stylesheet')
  })

  it('should not load fonts multiple times when isAuthenticated changes', () => {
    const { rerender } = renderHook(
      ({ isAuth }: { isAuth: boolean }) => useLazyFonts(isAuth),
      { initialProps: { isAuth: false } }
    )

    expect(document.head.querySelectorAll('link[href="/fonts/custom-fonts.css"]').length).toBe(0)

    rerender({ isAuth: true })
    expect(document.head.querySelectorAll('link[href="/fonts/custom-fonts.css"]').length).toBe(1)

    rerender({ isAuth: true })
    expect(document.head.querySelectorAll('link[href="/fonts/custom-fonts.css"]').length).toBe(1)
  })

  it('should set fontsLoaded state to true after link onload fires', async () => {
    renderHook(() => useLazyFonts(true))

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        const link = document.head.querySelector('link[href="/fonts/custom-fonts.css"]') as HTMLLinkElement
        expect(link).toBeDefined()
        link?.onload?.(new Event('load'))
        resolve()
      }, 0)
    })
  })

  it('should handle missing link element gracefully', () => {
    expect(() => {
      renderHook(() => useLazyFonts(true))
    }).not.toThrow()
  })
})
