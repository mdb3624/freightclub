import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CompletenessBar } from '../CompletenessBar'

describe('CompletenessBar', () => {
  it('shows 100% when all checks pass', () => {
    render(<CompletenessBar checks={[true, true, true, true]} />)
    expect(screen.getByText('100% complete')).toBeInTheDocument()
  })

  it('rounds the percentage for a partial completion', () => {
    render(<CompletenessBar checks={[true, true, true, false]} />)
    expect(screen.getByText('75% complete')).toBeInTheDocument()
  })

  it('shows 0% when no checks pass', () => {
    render(<CompletenessBar checks={[false, false]} />)
    expect(screen.getByText('0% complete')).toBeInTheDocument()
  })
})
