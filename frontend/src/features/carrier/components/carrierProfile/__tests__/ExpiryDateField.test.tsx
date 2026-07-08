import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ExpiryDateField } from '../ExpiryDateField'

describe('ExpiryDateField', () => {
  it('renders the label and calls onChange when the date is edited', () => {
    const onChange = vi.fn()
    render(<ExpiryDateField label="CDL expiry" testId="cdl-expiry-input" value="" onChange={onChange} />)

    expect(screen.getByText('CDL expiry')).toBeInTheDocument()
    fireEvent.change(screen.getByTestId('cdl-expiry-input'), { target: { value: '2027-08-15' } })
    expect(onChange).toHaveBeenCalledWith('2027-08-15')
  })

  it('shows a red "Expired" badge for a past date', () => {
    const past = new Date(Date.now() - 5 * 86_400_000).toISOString().slice(0, 10)
    render(<ExpiryDateField label="CDL expiry" testId="cdl-expiry-input" value={past} onChange={() => {}} />)
    expect(screen.getByText('Expired 5d ago')).toBeInTheDocument()
  })

  it('shows no badge when the value is empty', () => {
    render(<ExpiryDateField label="CDL expiry" testId="cdl-expiry-input" value="" onChange={() => {}} />)
    expect(screen.queryByText(/d left|Expired|Today/)).not.toBeInTheDocument()
  })
})
