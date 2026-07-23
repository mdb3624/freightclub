import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HomePage } from '../HomePage'

function renderHomePage() {
  const queryClient = new QueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('HomePage footer contact info', () => {
  it('renders a mailto link to mike.barnes@mdbfreightclub.com', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>)
    const link = screen.getByRole('link', { name: /mike\.barnes@mdbfreightclub\.com/i })
    expect(link).toHaveAttribute('href', 'mailto:mike.barnes@mdbfreightclub.com')
  })

  it('renders a tel link to (404) 960-9621', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>)
    const link = screen.getByRole('link', { name: /\(404\) 960-9621/i })
    expect(link).toHaveAttribute('href', 'tel:+14049609621')
  })

  it('renders the contact name Mike Barnes', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>)
    expect(screen.getByText('Mike Barnes')).toBeInTheDocument()
  })
})

describe('HomePage CTA simplification (US-860)', () => {
  it('does not render a "Get Started" button in the header', () => {
    renderHomePage()
    expect(screen.queryByTestId('header-get-started-btn')).not.toBeInTheDocument()
    expect(screen.queryByTestId('header-get-started-btn-mobile')).not.toBeInTheDocument()
  })

  it('does not render the "Find Loads" or "Post a Load" persona CTAs', () => {
    renderHomePage()
    expect(screen.queryByTestId('persona-carrier-cta')).not.toBeInTheDocument()
    expect(screen.queryByTestId('persona-shipper-cta')).not.toBeInTheDocument()
  })

  it('opens the Signup modal (not the Login modal) from the hero "Get Started Free" button', () => {
    renderHomePage()
    fireEvent.click(screen.getByTestId('hero-get-started-btn'))
    expect(screen.getByTestId('signup-modal')).toBeInTheDocument()
    expect(screen.queryByTestId('login-modal')).not.toBeInTheDocument()
  })

  it('opens the Signup modal from the final-CTA "Get Started Free" button', () => {
    renderHomePage()
    fireEvent.click(screen.getByTestId('final-cta-btn'))
    expect(screen.getByTestId('signup-modal')).toBeInTheDocument()
  })

  it('switches from Login modal to Signup modal via the in-modal link', () => {
    renderHomePage()
    fireEvent.click(screen.getByTestId('header-login-btn'))
    expect(screen.getByTestId('login-modal')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Sign up/i }))
    expect(screen.getByTestId('signup-modal')).toBeInTheDocument()
    expect(screen.queryByTestId('login-modal')).not.toBeInTheDocument()
  })

  it('switches from Signup modal to Login modal via the in-modal link', () => {
    renderHomePage()
    fireEvent.click(screen.getByTestId('hero-get-started-btn'))
    expect(screen.getByTestId('signup-modal')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }))
    expect(screen.getByTestId('login-modal')).toBeInTheDocument()
    expect(screen.queryByTestId('signup-modal')).not.toBeInTheDocument()
  })
})
