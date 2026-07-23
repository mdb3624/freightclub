import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from './Button'
import { PersonaThemeProvider } from '@/contexts/PersonaThemeContext'
import { useAuthStore } from '@/store/authStore'

function renderAsPersona(role: 'TRUCKER' | 'SHIPPER', ui: React.ReactNode) {
  useAuthStore.setState({
    user: { id: 'u1', email: 'a@b.com', firstName: 'A', lastName: 'B', role, tenantId: 't1' },
  })
  return render(<PersonaThemeProvider>{ui}</PersonaThemeProvider>)
}

// PROJECT_AUDIT_2026-07-23 item 5: primary/secondary previously hardcoded
// shipper cream/bronze colors regardless of persona context, so a Button
// rendered on a Carrier (dark) page looked wrong. These pin that both
// variants now pick up persona-specific Tailwind classes.
describe('Button persona theming', () => {
  beforeEach(() => {
    useAuthStore.setState({ accessToken: null, user: null, isAuthenticated: false })
  })

  it('primary variant uses carrier accent classes under carrier context', () => {
    renderAsPersona('TRUCKER', <Button variant="primary">Go</Button>)
    const btn = screen.getByRole('button', { name: 'Go' })
    expect(btn.className).toContain('bg-carrier-accent')
    expect(btn.className).not.toContain('bg-shipper-accent')
  })

  it('primary variant uses shipper accent classes under shipper context', () => {
    renderAsPersona('SHIPPER', <Button variant="primary">Go</Button>)
    const btn = screen.getByRole('button', { name: 'Go' })
    expect(btn.className).toContain('bg-shipper-accent')
    expect(btn.className).not.toContain('bg-carrier-accent')
  })

  it('secondary variant uses carrier surface classes under carrier context', () => {
    renderAsPersona('TRUCKER', <Button variant="secondary">Go</Button>)
    const btn = screen.getByRole('button', { name: 'Go' })
    expect(btn.className).toContain('bg-carrier-surface')
    expect(btn.className).not.toContain('bg-shipper-surface')
  })

  it('secondary variant uses shipper surface classes under shipper context', () => {
    renderAsPersona('SHIPPER', <Button variant="secondary">Go</Button>)
    const btn = screen.getByRole('button', { name: 'Go' })
    expect(btn.className).toContain('bg-shipper-surface')
    expect(btn.className).not.toContain('bg-carrier-surface')
  })

  it('explicit persona prop overrides the ambient context', () => {
    renderAsPersona('SHIPPER', <Button variant="primary" persona="carrier">Go</Button>)
    const btn = screen.getByRole('button', { name: 'Go' })
    expect(btn.className).toContain('bg-carrier-accent')
  })

  it('preserves a caller-supplied className alongside the variant classes', () => {
    renderAsPersona('SHIPPER', <Button variant="primary" className="my-extra-class">Go</Button>)
    const btn = screen.getByRole('button', { name: 'Go' })
    expect(btn.className).toContain('my-extra-class')
    expect(btn.className).toContain('bg-shipper-accent')
  })
})
