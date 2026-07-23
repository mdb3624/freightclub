import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '@/components/AppShell'
import { useMyDocuments } from '@/features/documents/hooks/useDocuments'
import { documentsApi } from '@/features/documents/api'
import { DOCUMENT_LABELS } from '@/features/documents/types'
import { downloadBlob } from '@/features/documents/utils/fileDownload'
import { Button } from '@/components/ui/Button'
import { ErrorBanner } from '@/components/ui/ErrorBanner'

function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1_048_576) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1_048_576).toFixed(1)} MB`
}

export function MyDocumentsPage() {
  const { data: documents = [], isLoading, isError } = useMyDocuments()
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  async function handleDownload(documentId: string, filename: string) {
    setDownloadingId(documentId)
    try {
      const blob = await documentsApi.download(documentId)
      downloadBlob(blob, filename)
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <AppShell maxWidth="lg">
      <div className="mb-6">
        <h1 data-testid="my-documents-page-title" className="text-2xl font-semibold text-gray-900">My Documents</h1>
        <p className="text-sm text-gray-500">Bills of lading, photos, and issue reports across all your loads.</p>
      </div>

      {isLoading && <p className="text-center text-gray-500 py-12">Loading...</p>}
      {isError && <ErrorBanner message="Failed to load your documents. Please try again." />}

      {!isLoading && !isError && documents.length === 0 && (
        <p className="text-center text-gray-500 py-12">No documents yet.</p>
      )}

      {!isLoading && !isError && documents.length > 0 && (
        <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
          {documents.map((doc) => (
            <li key={doc.id} className="flex items-start justify-between gap-3 p-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                    {DOCUMENT_LABELS[doc.documentType]}
                  </span>
                  <span data-testid="document-filename" className="truncate text-sm text-gray-800">{doc.originalFilename}</span>
                  <span className="text-xs text-gray-500">{formatBytes(doc.fileSizeBytes)}</span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  <Link to={`/shipper/loads/${doc.loadId}`} className="text-blue-600 hover:underline">
                    View load
                  </Link>
                  <span>{new Date(doc.createdAt).toLocaleString()}</span>
                </div>
              </div>
              {doc.contentType !== 'text/plain' && (
                <Button
                  variant="secondary"
                  isLoading={downloadingId === doc.id}
                  onClick={() => handleDownload(doc.id, doc.originalFilename)}
                >
                  Download
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  )
}
