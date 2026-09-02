import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { TeamMemberList } from './TeamMemberList'
import type { TeamMember } from './types'

// US-874 BR-7 / US-875/877 BR-4: a tenant can never be left with zero admins — the last
// remaining admin's remove/revoke actions must be disabled in-context, per the council-review
// UX placement decision (an explained disabled state, not a raw error after the fact).
describe('TeamMemberList', () => {
  const soleAdmin: TeamMember = {
    id: 'admin-1', email: 'a@x.com', firstName: 'Alice', lastName: 'Admin',
    isTenantAdmin: true, joinedAt: '2026-01-01',
  }
  const regularMember: TeamMember = {
    id: 'member-1', email: 'b@x.com', firstName: 'Bob', lastName: 'Member',
    isTenantAdmin: false, joinedAt: '2026-01-02',
  }

  it('disables remove and revoke for the last remaining admin', () => {
    render(
      <TeamMemberList
        currentUserId="admin-1"
        members={[soleAdmin, regularMember]}
        onRemove={vi.fn()}
        onSetAdmin={vi.fn()}
        isMutating={false}
        theme="light"
      />
    )

    expect(screen.getByTestId('remove-member-admin-1')).toBeDisabled()
    expect(screen.getByTestId('toggle-admin-admin-1')).toBeDisabled()
    // The regular member is unaffected.
    expect(screen.getByTestId('remove-member-member-1')).not.toBeDisabled()
  })

  it('allows removing an admin once a second admin exists', () => {
    const secondAdmin: TeamMember = { ...regularMember, id: 'admin-2', isTenantAdmin: true }
    render(
      <TeamMemberList
        currentUserId="admin-1"
        members={[soleAdmin, secondAdmin]}
        onRemove={vi.fn()}
        onSetAdmin={vi.fn()}
        isMutating={false}
        theme="light"
      />
    )

    expect(screen.getByTestId('remove-member-admin-1')).not.toBeDisabled()
    expect(screen.getByTestId('remove-member-admin-2')).not.toBeDisabled()
  })

  it('shows a confirm step before actually removing a member', () => {
    const onRemove = vi.fn()
    render(
      <TeamMemberList
        currentUserId="admin-1"
        members={[soleAdmin, regularMember]}
        onRemove={onRemove}
        onSetAdmin={vi.fn()}
        isMutating={false}
        theme="light"
      />
    )

    fireEvent.click(screen.getByTestId('remove-member-member-1'))
    expect(onRemove).not.toHaveBeenCalled()
    fireEvent.click(screen.getByTestId('confirm-remove-member-1'))
    expect(onRemove).toHaveBeenCalledWith('member-1')
  })

  it('calls onSetAdmin with the toggled value', () => {
    const onSetAdmin = vi.fn()
    render(
      <TeamMemberList
        currentUserId="admin-1"
        members={[soleAdmin, regularMember]}
        onRemove={vi.fn()}
        onSetAdmin={onSetAdmin}
        isMutating={false}
        theme="light"
      />
    )

    fireEvent.click(screen.getByTestId('toggle-admin-member-1'))
    expect(onSetAdmin).toHaveBeenCalledWith('member-1', true)
  })
})
