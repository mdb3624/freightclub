import { useEffect, useRef } from 'react'

export function useLazyFonts(isAuthenticated: boolean) {
  const fontsLoadedRef = useRef(false)

  useEffect(() => {
    if (isAuthenticated && !fontsLoadedRef.current) {
      const link = document.createElement('link')
      link.href = '/fonts/custom-fonts.css'
      link.rel = 'stylesheet'
      link.onload = () => {
        fontsLoadedRef.current = true
      }
      document.head.appendChild(link)
    }
  }, [isAuthenticated])
}
