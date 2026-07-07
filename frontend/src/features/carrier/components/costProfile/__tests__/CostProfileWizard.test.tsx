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

  it('completes successfully when a "$0 if paid off"-style field is left untouched', () => {
    // Regression test: fields like truck payment / insurance / permits /
    // additional cost / weekly goal are all genuinely valid at $0 (their
    // placeholder text says so), so a user who reasonably leaves one blank
    // must not be blocked at the final validation step.
    const onComplete = vi.fn()
    render(<CostProfileWizard initialData={undefined} onComplete={onComplete} />)

    fireEvent.change(screen.getByTestId('mpg-input'), { target: { value: '6.5' } })
    fireEvent.click(screen.getByTestId('region-chip-EAST'))
    // additional-cost-input intentionally left untouched (defaults to 0)
    fireEvent.click(screen.getByTestId('wizard-next-btn'))

    // truck-payment-input intentionally left untouched ("$0 if paid off")
    fireEvent.change(screen.getByTestId('insurance-input'), { target: { value: '600' } })
    // permits-input intentionally left untouched
    fireEvent.change(screen.getByTestId('annual-miles-input'), { target: { value: '100000' } })
    fireEvent.click(screen.getByTestId('wizard-next-btn'))

    // weekly-goal-input intentionally left untouched
    fireEvent.click(screen.getByTestId('weeks-chip-52'))
    fireEvent.click(screen.getByTestId('wizard-see-rpm-btn'))

    expect(screen.queryByTestId('wizard-validation-error')).not.toBeInTheDocument()
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({
      dieselRegion: 'EAST',
      additionalCostPerMile: 0,
      truckPaymentMonthly: 0,
      permitsMonthly: 0,
      weeklyIncomeGoal: 0,
      weeksWorkedPerYear: 52,
    }))
  })

  it('shows a specific, human-readable message naming the missing field', () => {
    const onComplete = vi.fn()
    render(<CostProfileWizard initialData={undefined} onComplete={onComplete} />)

    // Skip straight to step 3 without ever setting a diesel region or MPG
    fireEvent.click(screen.getByTestId('wizard-next-btn'))
    fireEvent.click(screen.getByTestId('wizard-next-btn'))
    fireEvent.click(screen.getByTestId('wizard-see-rpm-btn'))

    expect(onComplete).not.toHaveBeenCalled()
    const error = screen.getByTestId('wizard-validation-error')
    expect(error).toHaveTextContent('Diesel region (Step 1)')
    expect(error).toHaveTextContent('MPG (Step 1)')
  })
})
