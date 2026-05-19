interface ActionButtonsProps {
  status: string
  onEdit: () => void
  onCancel: () => void
  onViewDetails: () => void
}

export function ActionButtons({ status, onEdit, onCancel, onViewDetails }: ActionButtonsProps) {
  const isEditEnabled = ['DRAFT', 'OPEN', 'CLAIMED'].includes(status)
  const isCancelEnabled = !['DELIVERED', 'CANCELLED', 'DRAFT'].includes(status)

  return (
    <div className="flex gap-1">
      <button
        onClick={onEdit}
        disabled={!isEditEnabled}
        title="Edit"
        className={`w-6 h-6 flex items-center justify-center text-sm ${
          isEditEnabled ? 'cursor-pointer text-blue-600 hover:bg-blue-100 rounded' : 'cursor-not-allowed text-gray-300'
        }`}
      >
        ✎
      </button>
      <button
        onClick={onCancel}
        disabled={!isCancelEnabled}
        title="Cancel"
        className={`w-6 h-6 flex items-center justify-center text-sm ${
          isCancelEnabled ? 'cursor-pointer text-red-600 hover:bg-red-100 rounded' : 'cursor-not-allowed text-gray-300'
        }`}
      >
        ✕
      </button>
      <button
        onClick={onViewDetails}
        title="View Details"
        className="w-6 h-6 flex items-center justify-center text-sm cursor-pointer text-blue-600 hover:bg-blue-100 rounded"
      >
        →
      </button>
    </div>
  )
}
