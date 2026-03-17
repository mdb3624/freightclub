import { useToastStore } from '@/store/toastStore'

export function Toaster() {
  const { toasts, dismiss } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg text-sm font-medium pointer-events-auto cursor-pointer min-w-64 ${
            t.type === 'success'
              ? 'bg-green-600 text-white'
              : t.type === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-white'
          }`}
          onClick={() => dismiss(t.id)}
        >
          <span className="flex-1">{t.message}</span>
          <button
            className="opacity-70 hover:opacity-100 text-base leading-none"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
