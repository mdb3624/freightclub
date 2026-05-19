import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('renders empty state message', () => {
    const onPostLoad = vi.fn()
    render(<EmptyState onPostLoad={onPostLoad} />)
    expect(screen.getByText('No loads yet.')).toBeInTheDocument()
    expect(screen.getByText('Start by posting your first load.')).toBeInTheDocument()
  })

  it('renders post load button', () => {
    const onPostLoad = vi.fn()
    render(<EmptyState onPostLoad={onPostLoad} />)
    const button = screen.getByRole('button', { name: /Post a Load/i })
    expect(button).toBeInTheDocument()
  })

  it('calls onPostLoad when button is clicked', async () => {
    const onPostLoad = vi.fn()
    const user = userEvent.setup()
    render(<EmptyState onPostLoad={onPostLoad} />)
    const button = screen.getByRole('button', { name: /Post a Load/i })
    await user.click(button)
    expect(onPostLoad).toHaveBeenCalledTimes(1)
  })
})
