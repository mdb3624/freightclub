interface LoadTableProps {
  loads: Array<{
    id: string
    originCity: string
    originState: string
    destinationCity: string
    destinationState: string
    pickupEarliest: string
    pickupLatest: string
    status: string
    payAmount: number
    payUnit: string
    claimedByTruckerName: string | null
  }>
  onViewDetails: (id: string) => void
  onEdit: (id: string) => void
  onCancel: (id: string) => void
}

export function LoadTable({
  loads,
  onViewDetails,
  onEdit,
  onCancel,
}: LoadTableProps) {
  const statusColorMap: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-800',
    OPEN: 'bg-green-100 text-green-800',
    CLAIMED: 'bg-amber-100 text-amber-800',
    IN_TRANSIT: 'bg-blue-100 text-blue-800',
    DELIVERED: 'bg-gray-100 text-gray-800',
    CANCELLED: 'bg-red-100 text-red-800',
  }

  const isEditEnabled = (status: string) => ['DRAFT', 'OPEN', 'CLAIMED'].includes(status)
  const isCancelEnabled = (status: string) => !['DELIVERED', 'CANCELLED', 'DRAFT'].includes(status)

  return (
    <div className="overflow-x-auto mb-6">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="text-left px-3 py-2 font-semibold w-20">ID</th>
            <th className="text-left px-3 py-2 font-semibold w-24">Origin</th>
            <th className="text-left px-3 py-2 font-semibold w-24">Destination</th>
            <th className="text-left px-3 py-2 font-semibold w-32">Pickup Window</th>
            <th className="text-left px-3 py-2 font-semibold w-20">Status</th>
            <th className="text-left px-3 py-2 font-semibold w-20">Pay Rate</th>
            <th className="text-center px-3 py-2 font-semibold w-20">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loads.map((load) => (
            <tr key={load.id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-3 py-2 font-medium text-blue-600">{load.id}</td>
              <td className="px-3 py-2">{load.originCity}, {load.originState}</td>
              <td className="px-3 py-2">{load.destinationCity}, {load.destinationState}</td>
              <td className="px-3 py-2 text-xs">
                {new Date(load.pickupEarliest).toLocaleDateString()} {new Date(load.pickupEarliest).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}–{new Date(load.pickupLatest).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </td>
              <td className="px-3 py-2">
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${statusColorMap[load.status] || 'bg-gray-100'}`}>
                  {load.status}
                </span>
              </td>
              <td className="px-3 py-2">
                {load.payUnit === 'flat' ? `$${(load.payAmount / 1000).toFixed(1)}k` : `$${load.payAmount.toFixed(2)}/${load.payUnit}`}
              </td>
              <td className="px-3 py-2 text-center space-x-1">
                <button
                  onClick={() => onEdit(load.id)}
                  disabled={!isEditEnabled(load.status)}
                  className={`inline-block w-6 h-6 ${isEditEnabled(load.status) ? 'cursor-pointer text-blue-600 hover:bg-blue-100' : 'cursor-not-allowed text-gray-300'}`}
                  title="Edit"
                >
                  ✎
                </button>
                <button
                  onClick={() => onCancel(load.id)}
                  disabled={!isCancelEnabled(load.status)}
                  className={`inline-block w-6 h-6 ${isCancelEnabled(load.status) ? 'cursor-pointer text-red-600 hover:bg-red-100' : 'cursor-not-allowed text-gray-300'}`}
                  title="Cancel"
                >
                  ✕
                </button>
                <button
                  onClick={() => onViewDetails(load.id)}
                  className="inline-block w-6 h-6 cursor-pointer text-blue-600 hover:bg-blue-100"
                  title="View Details"
                >
                  →
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
