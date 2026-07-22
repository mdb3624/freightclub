import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HomePage } from '../HomePage'

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
