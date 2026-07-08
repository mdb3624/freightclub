import { describe, it, expect } from 'vitest'
import { daysUntil, expiryStatus, expiryColor, expiryLabel } from '../carrierProfile.schemas'

describe('expiry status helpers', () => {
  it('daysUntil returns null for a null date', () => {
    expect(daysUntil(null)).toBeNull()
  })

  it('expiryStatus returns "none" for a null date', () => {
    expect(expiryStatus(null)).toBe('none')
  })

  it('expiryStatus returns "expired" for a past date', () => {
    const past = new Date(Date.now() - 5 * 86_400_000).toISOString().slice(0, 10)
    expect(expiryStatus(past)).toBe('expired')
  })

  it('expiryStatus returns "critical" for a date within 30 days', () => {
    const soon = new Date(Date.now() + 10 * 86_400_000).toISOString().slice(0, 10)
    expect(expiryStatus(soon)).toBe('critical')
  })

  it('expiryStatus returns "warn" for a date within 90 days', () => {
    const midRange = new Date(Date.now() + 60 * 86_400_000).toISOString().slice(0, 10)
    expect(expiryStatus(midRange)).toBe('warn')
  })

  it('expiryStatus returns "ok" for a date more than 90 days out', () => {
    const farOut = new Date(Date.now() + 200 * 86_400_000).toISOString().slice(0, 10)
    expect(expiryStatus(farOut)).toBe('ok')
  })

  it('expiryColor maps each status to the correct hex per the prototype', () => {
    expect(expiryColor('expired')).toBe('#E74C3C')
    expect(expiryColor('critical')).toBe('#E74C3C')
    expect(expiryColor('warn')).toBe('#F59E0B')
    expect(expiryColor('ok')).toBe('#27AE60')
    expect(expiryColor('none')).toBe('#2A2A2A')
  })

  it('expiryLabel describes an expired date in the past tense', () => {
    const past = new Date(Date.now() - 5 * 86_400_000).toISOString().slice(0, 10)
    expect(expiryLabel(past)).toBe('Expired 5d ago')
  })

  it('expiryLabel describes a future date as "Nd left"', () => {
    const soon = new Date(Date.now() + 10 * 86_400_000)
    soon.setUTCHours(23, 59, 59, 999) // use UTC to match toISOString() timezone
    expect(expiryLabel(soon.toISOString().slice(0, 10))).toBe('10d left')
  })
})
