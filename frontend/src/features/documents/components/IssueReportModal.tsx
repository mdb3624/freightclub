import { useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useReportIssue } from '../hooks/useDocuments'

interface Props {
  loadId: string
  onClose: () => void
}

export function IssueReportModal({ loadId, onClose }: Props) {
  const [description, setDescription] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const photoRef = useRef<HTMLInputElement>(null)
  const { mutate: reportIssue, isPending } = useReportIssue(loadId)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!description.trim()) return
    reportIssue(
      { description: description.trim(), photo: photo ?? undefined },
      { onSuccess: onClose },
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="issue-dialog-title"
        className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="issue-dialog-title" className="text-base font-semibold text-gray-900 mb-1">
          Report Issue
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Describe the problem encountered during transit. The shipper will be notified.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={4}
              placeholder="Describe the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Photo (optional)
            </label>
            <div className="flex items-center gap-3">
              <input
                ref={photoRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => photoRef.current?.click()}
              >
                Choose Photo
              </Button>
              {photo && (
                <span className="text-sm text-gray-600 truncate max-w-[160px]">{photo.name}</span>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isPending} disabled={!description.trim()}>
              Submit Report
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
