interface EmptyStateProps {
  onPostLoad: () => void
}

export function EmptyState({ onPostLoad }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <p className="text-lg font-semibold text-gray-900">No loads yet.</p>
        <p className="mt-2 text-sm text-gray-600">Start by posting your first load.</p>
        <button
          onClick={onPostLoad}
          className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
        >
          + Post a Load
        </button>
      </div>
    </div>
  )
}
