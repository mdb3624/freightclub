import { describe, it, expect } from 'vitest'
import { validateEmail, validatePassword } from './validation'

describe('Email Validation', () => {
  it('should reject empty email', () => {
    expect(validateEmail('')).toBe('Email is required')
  })

  it('should reject whitespace-only email', () => {
    expect(validateEmail('   ')).toBe('Email is required')
  })

  it('should reject invalid email format - no @', () => {
    expect(validateEmail('notanemail')).toBe('Enter a valid email')
  })

  it('should reject invalid email format - no domain', () => {
    expect(validateEmail('user@')).toBe('Enter a valid email')
  })

  it('should reject invalid email format - no TLD', () => {
    expect(validateEmail('user@domain')).toBe('Enter a valid email')
  })

  it('should accept valid email', () => {
    expect(validateEmail('user@example.com')).toBeUndefined()
  })

  it('should accept valid email with subdomain', () => {
    expect(validateEmail('user@mail.example.co.uk')).toBeUndefined()
  })

  it('should accept valid email with plus addressing', () => {
    expect(validateEmail('user+tag@example.com')).toBeUndefined()
  })

  it('should accept valid email with numbers', () => {
    expect(validateEmail('user123@example456.com')).toBeUndefined()
  })

  it('should accept valid email with dots in local part', () => {
    expect(validateEmail('first.last@example.com')).toBeUndefined()
  })

  it('should accept valid email with hyphens in domain', () => {
    expect(validateEmail('user@example-domain.com')).toBeUndefined()
  })
})

describe('Password Validation', () => {
  it('should reject empty password', () => {
    expect(validatePassword('')).toBe('Password is required')
  })

  it('should reject whitespace-only password', () => {
    expect(validatePassword('   ')).toBe('Password is required')
  })

  it('should accept any non-empty password', () => {
    expect(validatePassword('a')).toBeUndefined()
  })

  it('should accept single character password', () => {
    expect(validatePassword('x')).toBeUndefined()
  })

  it('should accept long password', () => {
    expect(validatePassword('this is a very long password with spaces and special chars!@#$')).toBeUndefined()
  })

  it('should accept password with special characters', () => {
    expect(validatePassword('P@ssw0rd!#$%^&*()')).toBeUndefined()
  })
})
