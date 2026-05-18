import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import type { UpdateProfileValues } from '@/features/profile/types'
import { CostProfileSection } from './CostProfileSection'

/**
 * Test wrapper component to provide react-hook-form context
 * CostProfileSection requires register and control from useForm
 */
function CostProfileSectionTestWrapper(props?: { defaultValues?: Partial<UpdateProfileValues> }) {
  const { register, control } = useForm<UpdateProfileValues>({
    defaultValues: {
      truckPaymentLease: 0,
      insurance: 0,
      iftaIrpPermits: 0,
      phoneEldMisc: 0,
      perDiemDailyRate: 0,
      perDiemDaysPerMonth: 0,
      fuelCostPerGallon: 0,
      milesPerGallon: 0,
      maintenanceCostPerMile: 0,
      monthlyMilesTarget: 0,
      targetMarginPerMile: 0,
      ...props?.defaultValues,
    },
  })

  return <CostProfileSection register={register} control={control} />
}

describe('CostProfileSection', () => {
  describe('AC1: Renders all three sections with correct headings', () => {
    it('renders all three sections with correct headings', () => {
      render(<CostProfileSectionTestWrapper />)

      // Main section heading
      expect(screen.getByText(/cost profile/i)).toBeInTheDocument()

      // Three subsection headings
      expect(screen.getByText(/fixed monthly costs/i)).toBeInTheDocument()
      expect(screen.getByText(/variable costs/i)).toBeInTheDocument()
      expect(screen.getByText(/operational/i)).toBeInTheDocument()
    })
  })

  describe('AC2: Renders all 10 input fields', () => {
    it('renders all 10 input fields', () => {
      render(<CostProfileSectionTestWrapper />)

      // Fixed Monthly Costs (4 fields)
      expect(screen.getByLabelText(/truck payment \/ lease/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^insurance/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/ifta \/ irp \/ permits/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/phone \/ eld \/ misc/i)).toBeInTheDocument()

      // Variable Costs (4 fields)
      expect(screen.getByLabelText(/diesel price/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/fuel efficiency/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/maintenance reserve/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/per diem \(\$\/day\)/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/days\/month/i)).toBeInTheDocument()

      // Operational (2 fields)
      expect(screen.getByLabelText(/miles driven \(monthly\)/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/target profit margin/i)).toBeInTheDocument()
    })
  })

  describe('AC3: Displays CPM breakdown when monthly miles > 0', () => {
    it('displays CPM breakdown when monthly miles > 0', () => {
      render(
        <CostProfileSectionTestWrapper
          defaultValues={{
            monthlyMilesTarget: 8000,
            truckPaymentLease: 1800,
            insurance: 900,
            iftaIrpPermits: 200,
            phoneEldMisc: 150,
            fuelCostPerGallon: 3.5,
            milesPerGallon: 6.5,
            maintenanceCostPerMile: 0.2,
            targetMarginPerMile: 0.6,
          }}
        />
      )

      // CostProfileSummary should be visible
      expect(screen.getByText(/calculated cost breakdown/i)).toBeInTheDocument()
      expect(screen.getByText('Fixed CPM')).toBeInTheDocument()
      expect(screen.getByText(/variable cpm \(fuel \+ maint\.\)/i)).toBeInTheDocument()
      expect(screen.getByText('Total CPM')).toBeInTheDocument()
      // Verify Minimum RPM label is present (in the breakdown section, not the helper text)
      const minRpmElements = screen.getAllByText(/Minimum RPM/)
      expect(minRpmElements.length).toBeGreaterThan(0)
    })
  })

  describe('AC4: Hides CPM breakdown when monthly miles = 0', () => {
    it('hides CPM breakdown when monthly miles = 0', () => {
      render(
        <CostProfileSectionTestWrapper
          defaultValues={{
            monthlyMilesTarget: 0,
            truckPaymentLease: 1800,
          }}
        />
      )

      // CostProfileSummary should NOT be visible
      expect(screen.queryByText(/calculated cost breakdown/i)).not.toBeInTheDocument()
    })
  })

  describe('AC5: Calculates fixed CPM correctly', () => {
    it('calculates fixed CPM correctly: (1800+900+200+150) / 8000 = 0.3813', () => {
      render(
        <CostProfileSectionTestWrapper
          defaultValues={{
            monthlyMilesTarget: 8000,
            truckPaymentLease: 1800,
            insurance: 900,
            iftaIrpPermits: 200,
            phoneEldMisc: 150,
            perDiemDailyRate: 0,
            perDiemDaysPerMonth: 0,
          }}
        />
      )

      const expectedFixedCpm = (1800 + 900 + 200 + 150) / 8000
      const expectedText = `$${expectedFixedCpm.toFixed(4)}/mi`

      // Find the Fixed CPM value in the breakdown (second row after the label)
      const fixedCpmLabel = screen.getByText('Fixed CPM')
      const breakdownSection = fixedCpmLabel.closest('.rounded-lg')
      expect(breakdownSection).toHaveTextContent(expectedText)
    })

    it('calculates fixed CPM including per diem: (1800+900+200+150+16000) / 8000 = 2.3813', () => {
      render(
        <CostProfileSectionTestWrapper
          defaultValues={{
            monthlyMilesTarget: 8000,
            truckPaymentLease: 1800,
            insurance: 900,
            iftaIrpPermits: 200,
            phoneEldMisc: 150,
            perDiemDailyRate: 800,
            perDiemDaysPerMonth: 20,
          }}
        />
      )

      const perDiemTotal = 800 * 20
      const expectedFixedCpm = (1800 + 900 + 200 + 150 + perDiemTotal) / 8000
      const expectedText = `$${expectedFixedCpm.toFixed(4)}/mi`

      // Find the Fixed CPM value in the breakdown section
      const fixedCpmLabel = screen.getByText('Fixed CPM')
      const breakdownSection = fixedCpmLabel.closest('.rounded-lg')
      expect(breakdownSection).toHaveTextContent(expectedText)
    })
  })

  describe('AC6: Handles zero MPG safely (no division by zero)', () => {
    it('handles zero MPG safely - fuel CPM = 0 when MPG = 0', () => {
      render(
        <CostProfileSectionTestWrapper
          defaultValues={{
            monthlyMilesTarget: 8000,
            truckPaymentLease: 1800,
            fuelCostPerGallon: 3.5,
            milesPerGallon: 0, // Zero MPG - should not cause division by zero
            maintenanceCostPerMile: 0.2,
          }}
        />
      )

      // Variable CPM = 0 (fuel) + 0.2 (maint) = 0.2
      // Fixed CPM = 1800 / 8000 = 0.225
      // Total CPM = 0.225 + 0.2 = 0.425
      const variableCpm = 0 + 0.2
      const fixedCpm = 1800 / 8000
      const totalCpm = fixedCpm + variableCpm

      const expectedVariableText = `$${variableCpm.toFixed(4)}/mi`
      const expectedTotalText = `$${totalCpm.toFixed(4)}/mi`

      // Verify both values exist in the breakdown section
      const breakdownSection = screen.getByText(/calculated cost breakdown/i).closest('.rounded-lg')
      expect(breakdownSection).toHaveTextContent(expectedVariableText)
      expect(breakdownSection).toHaveTextContent(expectedTotalText)
    })

    it('calculates total CPM correctly with all cost components', () => {
      render(
        <CostProfileSectionTestWrapper
          defaultValues={{
            monthlyMilesTarget: 8000,
            truckPaymentLease: 1800,
            insurance: 900,
            iftaIrpPermits: 200,
            phoneEldMisc: 150,
            fuelCostPerGallon: 3.5,
            milesPerGallon: 6.5,
            maintenanceCostPerMile: 0.17,
            targetMarginPerMile: 0.6,
          }}
        />
      )

      // Calculations:
      const fixedMonthly = 1800 + 900 + 200 + 150
      const fixedCpm = fixedMonthly / 8000
      const fuelCpm = 3.5 / 6.5
      const variableCpm = fuelCpm + 0.17
      const totalCpm = fixedCpm + variableCpm
      const minRpm = totalCpm + 0.6

      const expectedFixedText = `$${fixedCpm.toFixed(4)}/mi`
      const expectedVariableText = `$${variableCpm.toFixed(4)}/mi`
      const expectedTotalText = `$${totalCpm.toFixed(4)}/mi`
      const expectedRpmText = `$${minRpm.toFixed(4)}/mi`

      // Verify all values in the breakdown section
      const breakdownSection = screen.getByText(/calculated cost breakdown/i).closest('.rounded-lg')
      expect(breakdownSection).toHaveTextContent(expectedFixedText)
      expect(breakdownSection).toHaveTextContent(expectedVariableText)
      expect(breakdownSection).toHaveTextContent(expectedTotalText)
      expect(breakdownSection).toHaveTextContent(expectedRpmText)
    })
  })

  describe('Real-time updates via useWatch', () => {
    it('should hide breakdown when monthlyMilesTarget is 0', () => {
      render(<CostProfileSectionTestWrapper defaultValues={{ monthlyMilesTarget: 0 }} />)
      expect(screen.queryByText(/calculated cost breakdown/i)).not.toBeInTheDocument()
    })

    it('should display breakdown when monthlyMilesTarget > 0', () => {
      render(
        <CostProfileSectionTestWrapper
          defaultValues={{
            monthlyMilesTarget: 10000,
            truckPaymentLease: 2000,
          }}
        />
      )
      expect(screen.getByText(/calculated cost breakdown/i)).toBeInTheDocument()
      const breakdownSection = screen.getByText(/calculated cost breakdown/i).closest('.rounded-lg')
      const expectedFixedCpm = 2000 / 10000
      expect(breakdownSection).toHaveTextContent(`$${expectedFixedCpm.toFixed(4)}/mi`)
    })
  })
})
