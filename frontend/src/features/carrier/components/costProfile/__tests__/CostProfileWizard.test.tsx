import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CostProfileWizard } from '../CostProfileWizard'

vi.mock('@/features/market/hooks/useDieselPrices', () => ({
  useDieselPrices: () => ({
    data: {
      eastPrice: 3.82, eastDelta: null, midwestPrice: 3.71, midwestDelta: null,
      southPrice: 3.61, southDelta: null, rockyPrice: 3.95, rockyDelta: null,
      westPrice: 4.12, westDelta: null, period: '2026-07', stale: false, available: true,
    },
    isLoading: false,
    error: null,
  }),
}))

describe('CostProfileWizard', () => {
  it('walks through all 3 steps and calls onComplete with form data', () => {
    const onComplete = vi.fn()
    render(<CostProfileWizard initialData={undefined} onComplete={onComplete} />)

    // Step 1: Fuel
    expect(screen.getByTestId('wizard-step-1')).toBeInTheDocument()
    fireEvent.change(screen.getByTestId('mpg-input'), { target: { value: '6.5' } })
    fireEvent.click(screen.getByTestId('region-chip-MIDWEST'))
    fireEvent.change(screen.getByTestId('additional-cost-input'), { target: { value: '0.08' } })
    fireEvent.click(screen.getByTestId('wizard-next-btn'))

    // Step 2: Fixed Costs
    expect(screen.getByTestId('wizard-step-2')).toBeInTheDocument()
    fireEvent.change(screen.getByTestId('truck-payment-input'), { target: { value: '1200' } })
    fireEvent.change(screen.getByTestId('insurance-input'), { target: { value: '600' } })
    fireEvent.change(screen.getByTestId('permits-input'), { target: { value: '150' } })
    fireEvent.change(screen.getByTestId('annual-miles-input'), { target: { value: '120000' } })
    fireEvent.click(screen.getByTestId('wizard-next-btn'))

    // Step 3: Income Goal
    expect(screen.getByTestId('wizard-step-3')).toBeInTheDocument()
    fireEvent.change(screen.getByTestId('weekly-goal-input'), { target: { value: '2000' } })
    fireEvent.click(screen.getByTestId('weeks-chip-48'))
    fireEvent.click(screen.getByTestId('wizard-see-rpm-btn'))

    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({
      dieselRegion: 'MIDWEST',
      milesPerGallon: 6.5,
      annualMiles: 120000,
      weeklyIncomeGoal: 2000,
      weeksWorkedPerYear: 48,
    }))
  })
})
