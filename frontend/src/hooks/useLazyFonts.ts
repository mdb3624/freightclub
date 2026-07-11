import { useEffect, useRef } from 'react'

export async function loadCustomFonts(): Promise<void> {
  await Promise.all([
    import('@fontsource/sora/400.css'),
    import('@fontsource/sora/600.css'),
    import('@fontsource/sora/700.css'),
    import('@fontsource/inter/400.css'),
    import('@fontsource/inter/500.css'),
    import('@fontsource/inter/600.css'),
    import('@fontsource/inter/700.css'),
  ])
}

export function useLazyFonts(isAuthenticated: boolean, loadFonts: () => Promise<void> = loadCustomFonts) {
  const fontsLoadedRef = useRef(false)

  useEffect(() => {
    if (isAuthenticated && !fontsLoadedRef.current) {
      fontsLoadedRef.current = true
      loadFonts().catch((error) => {
        console.error('Failed to load custom fonts:', error)
      })
    }
  }, [isAuthenticated, loadFonts])
}
