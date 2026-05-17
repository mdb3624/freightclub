import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { LoginPage } from '@/pages/LoginPage'

describe('LoginPage - System Fonts', () => {
  beforeEach(() => {
    // Verify custom fonts CSS is not loaded on login page
    const customFontsLinks = document.head.querySelectorAll('link[href="/fonts/custom-fonts.css"]')
    expect(customFontsLinks.length).toBe(0)
  })

  it('should render without custom fonts loaded', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </QueryClientProvider>
    )

    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
    const customFontsLinks = document.head.querySelectorAll('link[href="/fonts/custom-fonts.css"]')
    expect(customFontsLinks.length).toBe(0)
  })

  it('should not load custom fonts on unauthenticated pages', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </QueryClientProvider>
    )

    const customFontsLinks = document.head.querySelectorAll('link[href="/fonts/custom-fonts.css"]')
    expect(customFontsLinks.length).toBe(0)
  })
})
