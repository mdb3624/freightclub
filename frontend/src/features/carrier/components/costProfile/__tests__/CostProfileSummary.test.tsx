import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CostProfileSummary } from '../CostProfileSummary'

const profile = {
  dieselRegion: 'MIDWEST' as const, milesPerGallon: 6.5, additionalCostPerMile: 0.08,
  truckPaymentMonthly: 1200, insuranceMonthly: 600, permitsMonthly: 150,
  annualMiles: 120000, weeklyIncomeGoal: 2000, weeksWorkedPerYear: 48,
  fuelCpm: 0.6, variableCpm: 0.68, fixedCpm: 0.195, marginCpm: 0.8,
  breakevenRpm: 0.875, minRpm: 1.675, targetRpm: 2.01,
}

describe('CostProfileSummary', () => {
  it('renders the three KPI tiles with correct values', () => {
    render(<CostProfileSummary profile={profile} onEdit={vi.fn()} />)
    expect(screen.getByTestId('kpi-breakeven-value')).toHaveTextContent('$0.88')
    expect(screen.getByTestId('kpi-min-rpm-value')).toHaveTextContent('$1.68')
    expect(screen.getByTestId('kpi-target-value')).toHaveTextContent('$2.01')
  })

  it('calls onEdit when the Update Cost Profile button is clicked', () => {
    const onEdit = vi.fn()
    render(<CostProfileSummary profile={profile} onEdit={onEdit} />)
    fireEvent.click(screen.getByTestId('update-cost-profile-btn'))
    expect(onEdit).toHaveBeenCalledOnce()
  })
})
