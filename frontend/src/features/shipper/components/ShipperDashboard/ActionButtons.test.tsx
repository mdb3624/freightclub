import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ActionButtons } from './ActionButtons'

describe('ActionButtons', () => {
  it('enables edit for DRAFT status', () => {
    const onEdit = vi.fn()
    const onCancel = vi.fn()
    const onViewDetails = vi.fn()
    render(
      <ActionButtons
        status="DRAFT"
        onEdit={onEdit}
        onCancel={onCancel}
        onViewDetails={onViewDetails}
      />
    )
    const editButton = screen.getByTitle('Edit')
    expect(editButton).not.toHaveClass('cursor-not-allowed')
  })

  it('enables edit for OPEN status', () => {
    const onEdit = vi.fn()
    const onCancel = vi.fn()
    const onViewDetails = vi.fn()
    render(
      <ActionButtons
        status="OPEN"
        onEdit={onEdit}
        onCancel={onCancel}
        onViewDetails={onViewDetails}
      />
    )
    const editButton = screen.getByTitle('Edit')
    expect(editButton).not.toHaveClass('cursor-not-allowed')
  })

  it('disables edit for DELIVERED status', () => {
    const onEdit = vi.fn()
    const onCancel = vi.fn()
    const onViewDetails = vi.fn()
    render(
      <ActionButtons
        status="DELIVERED"
        onEdit={onEdit}
        onCancel={onCancel}
        onViewDetails={onViewDetails}
      />
    )
    const editButton = screen.getByTitle('Edit')
    expect(editButton).toHaveClass('cursor-not-allowed')
  })

  it('disables cancel for DELIVERED status', () => {
    const onEdit = vi.fn()
    const onCancel = vi.fn()
    const onViewDetails = vi.fn()
    render(
      <ActionButtons
        status="DELIVERED"
        onEdit={onEdit}
        onCancel={onCancel}
        onViewDetails={onViewDetails}
      />
    )
    const cancelButton = screen.getByTitle('Cancel')
    expect(cancelButton).toHaveClass('cursor-not-allowed')
  })

  it('disables cancel for DRAFT status', () => {
    const onEdit = vi.fn()
    const onCancel = vi.fn()
    const onViewDetails = vi.fn()
    render(
      <ActionButtons
        status="DRAFT"
        onEdit={onEdit}
        onCancel={onCancel}
        onViewDetails={onViewDetails}
      />
    )
    const cancelButton = screen.getByTitle('Cancel')
    expect(cancelButton).toHaveClass('cursor-not-allowed')
  })

  it('enables cancel for OPEN status', () => {
    const onEdit = vi.fn()
    const onCancel = vi.fn()
    const onViewDetails = vi.fn()
    render(
      <ActionButtons
        status="OPEN"
        onEdit={onEdit}
        onCancel={onCancel}
        onViewDetails={onViewDetails}
      />
    )
    const cancelButton = screen.getByTitle('Cancel')
    expect(cancelButton).not.toHaveClass('cursor-not-allowed')
  })

  it('always enables view details button', () => {
    const onEdit = vi.fn()
    const onCancel = vi.fn()
    const onViewDetails = vi.fn()
    render(
      <ActionButtons
        status="DELIVERED"
        onEdit={onEdit}
        onCancel={onCancel}
        onViewDetails={onViewDetails}
      />
    )
    const detailsButton = screen.getByTitle('View Details')
    expect(detailsButton).not.toHaveClass('cursor-not-allowed')
  })

  it('calls onEdit when edit button is clicked', async () => {
    const onEdit = vi.fn()
    const onCancel = vi.fn()
    const onViewDetails = vi.fn()
    const user = userEvent.setup()
    render(
      <ActionButtons
        status="OPEN"
        onEdit={onEdit}
        onCancel={onCancel}
        onViewDetails={onViewDetails}
      />
    )
    const editButton = screen.getByTitle('Edit')
    await user.click(editButton)
    expect(onEdit).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when cancel button is clicked', async () => {
    const onEdit = vi.fn()
    const onCancel = vi.fn()
    const onViewDetails = vi.fn()
    const user = userEvent.setup()
    render(
      <ActionButtons
        status="OPEN"
        onEdit={onEdit}
        onCancel={onCancel}
        onViewDetails={onViewDetails}
      />
    )
    const cancelButton = screen.getByTitle('Cancel')
    await user.click(cancelButton)
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('calls onViewDetails when details button is clicked', async () => {
    const onEdit = vi.fn()
    const onCancel = vi.fn()
    const onViewDetails = vi.fn()
    const user = userEvent.setup()
    render(
      <ActionButtons
        status="OPEN"
        onEdit={onEdit}
        onCancel={onCancel}
        onViewDetails={onViewDetails}
      />
    )
    const detailsButton = screen.getByTitle('View Details')
    await user.click(detailsButton)
    expect(onViewDetails).toHaveBeenCalledTimes(1)
  })
})
