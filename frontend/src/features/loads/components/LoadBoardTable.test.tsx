import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { LoadBoardTable } from './LoadBoardTable'
import type { LoadSummary } from '../types'

function baseLoad(overrides: Partial<LoadSummary> = {}): LoadSummary {
  return {
    id: 'load-1',
    status: 'OPEN',
    origin: 'New York, NY',
    destination: 'Tampa, FL',
    distanceMiles: 1050,
    pickupFrom: '2026-07-14T08:00:00',
    equipmentType: 'DRY_VAN',
    payRate: 2.5,
    payRateType: 'PER_MILE',
    paymentTerms: null,
    deliveryTo: '2026-07-16T08:00:00',
    createdAt: '2026-07-13T00:00:00',
    shipperAvgStars: null,
    shipperRatingCount: 0,
    regionUsed: null,
    asOfPeriod: null,
    isFallback: false,
    ...overrides,
  }
}

function renderTable(loads: LoadSummary[]) {
  render(
    <BrowserRouter>
      <LoadBoardTable loads={loads} />
    </BrowserRouter>
  )
}

describe('LoadBoardTable fuel region caption (US-854)', () => {
  it('shows the region and as-of date when resolved normally', () => {
    renderTable([baseLoad({ regionUsed: 'EAST', asOfPeriod: '2026-07-06', isFallback: false })])

    expect(screen.getByText(/Diesel: East Coast/)).toBeInTheDocument()
    expect(screen.getByText(/Jul 6/)).toBeInTheDocument()
  })

  it('shows the fallback indicator when isFallback is true', () => {
    renderTable([baseLoad({ regionUsed: 'SOUTH', asOfPeriod: null, isFallback: true })])

    expect(screen.getByText(/Est\. \(home region\)/)).toBeInTheDocument()
    expect(screen.queryByText(/Diesel: South/)).not.toBeInTheDocument()
  })

  it('omits the caption entirely when regionUsed is null (no cost profile / EIA unavailable)', () => {
    renderTable([baseLoad({ regionUsed: null, asOfPeriod: null, isFallback: false })])

    expect(screen.queryByText(/⛽/)).not.toBeInTheDocument()
  })

  it('maps all 5 EIA region codes to their human-readable labels', () => {
    const regions: Array<[string, string]> = [
      ['EAST', 'East Coast'],
      ['MIDWEST', 'Midwest'],
      ['SOUTH', 'Gulf Coast'],
      ['ROCKY', 'Rocky Mountain'],
      ['WEST', 'West Coast'],
    ]
    for (const [code, label] of regions) {
      const { unmount } = render(
        <BrowserRouter>
          <LoadBoardTable loads={[baseLoad({ id: `load-${code}`, regionUsed: code, asOfPeriod: '2026-07-06' })]} />
        </BrowserRouter>
      )
      expect(screen.getByText(new RegExp(`Diesel: ${label}`))).toBeInTheDocument()
      unmount()
    }
  })
})
