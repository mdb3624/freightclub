interface SummaryStripProps {
  open: number
  claimed: number
  inTransit: number
  delivered: number
}

export function SummaryStrip({ open, claimed, inTransit, delivered }: SummaryStripProps) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div data-testid="summary-open-card" className="rounded-lg bg-green-50 p-4 border border-green-200">
        <div className="text-sm font-medium text-green-700">OPEN</div>
        <div className="mt-2 text-2xl font-bold text-green-900">{open}</div>
      </div>
      <div data-testid="summary-claimed-card" className="rounded-lg bg-amber-50 p-4 border border-amber-200">
        <div className="text-sm font-medium text-amber-700">CLAIMED</div>
        <div className="mt-2 text-2xl font-bold text-amber-900">{claimed}</div>
      </div>
      <div data-testid="summary-in-transit-card" className="rounded-lg bg-blue-50 p-4 border border-blue-200">
        <div className="text-sm font-medium text-blue-700">IN TRANSIT</div>
        <div className="mt-2 text-2xl font-bold text-blue-900">{inTransit}</div>
      </div>
      <div data-testid="summary-delivered-card" className="rounded-lg bg-gray-50 p-4 border border-gray-200">
        <div className="text-sm font-medium text-gray-700">DELIVERED</div>
        <div className="mt-2 text-2xl font-bold text-gray-900">{delivered}</div>
      </div>
    </div>
  )
}
