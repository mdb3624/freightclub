import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Pagination } from './Pagination'

describe('Pagination', () => {
  it('disables prev button on first page', () => {
    const onPageChange = vi.fn()
    render(
      <Pagination currentPage={0} totalPages={5} onPageChange={onPageChange} />
    )
    const prevButton = screen.getByRole('button', { name: /Previous/i })
    expect(prevButton).toBeDisabled()
  })

  it('enables prev button on non-first page', () => {
    const onPageChange = vi.fn()
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />
    )
    const prevButton = screen.getByRole('button', { name: /Previous/i })
    expect(prevButton).not.toBeDisabled()
  })

  it('disables next button on last page', () => {
    const onPageChange = vi.fn()
    render(
      <Pagination currentPage={4} totalPages={5} onPageChange={onPageChange} />
    )
    const nextButton = screen.getByRole('button', { name: /Next/i })
    expect(nextButton).toBeDisabled()
  })

  it('enables next button on non-last page', () => {
    const onPageChange = vi.fn()
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />
    )
    const nextButton = screen.getByRole('button', { name: /Next/i })
    expect(nextButton).not.toBeDisabled()
  })

  it('calls onPageChange with correct page on prev click', async () => {
    const onPageChange = vi.fn()
    const user = userEvent.setup()
    render(
      <Pagination currentPage={2} totalPages={5} onPageChange={onPageChange} />
    )
    const prevButton = screen.getByRole('button', { name: /Previous/i })
    await user.click(prevButton)
    expect(onPageChange).toHaveBeenCalledWith(1)
  })

  it('calls onPageChange with correct page on next click', async () => {
    const onPageChange = vi.fn()
    const user = userEvent.setup()
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />
    )
    const nextButton = screen.getByRole('button', { name: /Next/i })
    await user.click(nextButton)
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('displays correct page information', () => {
    const onPageChange = vi.fn()
    render(
      <Pagination currentPage={2} totalPages={5} onPageChange={onPageChange} />
    )
    expect(screen.getByText('Page 3 of 5')).toBeInTheDocument()
  })
})
