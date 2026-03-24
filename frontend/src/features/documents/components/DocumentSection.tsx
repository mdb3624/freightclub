import { useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { documentsApi } from '../api'
import { DOCUMENT_LABELS } from '../types'
import type { LoadDocument } from '../types'
import { useUploadBolPhoto, useUploadPodPhoto } from '../hooks/useDocuments'
import { IssueReportModal } from './IssueReportModal'

interface Props {
  loadId: string
  loadStatus: string
  role: 'SHIPPER' | 'TRUCKER'
  documents: LoadDocument[]
}

function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1_048_576) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1_048_576).toFixed(1)} MB`
}

export function DocumentSection({ loadId, loadStatus, role, documents }: Props) {
  const bolPhotoRef = useRef<HTMLInputElement>(null)
  const podPhotoRef = useRef<HTMLInputElement>(null)
  const [showIssueModal, setShowIssueModal] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const { mutate: uploadBol, isPending: isUploadingBol } = useUploadBolPhoto(loadId)
  const { mutate: uploadPod, isPending: isUploadingPod } = useUploadPodPhoto(loadId)

  function handleBolFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) uploadBol(file)
    e.target.value = ''
  }

  function handlePodFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) uploadPod(file)
    e.target.value = ''
  }

  async function handleDownload(doc: LoadDocument) {
    setDownloadingId(doc.id)
    try {
      await documentsApi.download(doc.id, doc.originalFilename)
    } finally {
      setDownloadingId(null)
    }
  }

  async function handleExport() {
    setIsExporting(true)
    try {
      await documentsApi.exportPdf(loadId)
    } finally {
      setIsExporting(false)
    }
  }

  const hasBolPhoto = documents.some((d) => d.documentType === 'BOL_PHOTO')
  const hasPodPhoto = documents.some((d) => d.documentType === 'POD_PHOTO')

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Documents</h3>
        <Button variant="secondary" isLoading={isExporting} onClick={handleExport}>
          Export PDF
        </Button>
      </div>

      {/* Document list */}
      {documents.length > 0 ? (
        <ul className="divide-y divide-gray-100 mb-4">
          {documents.map((doc) => (
            <li key={doc.id} className="flex items-start justify-between py-3 gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                    {DOCUMENT_LABELS[doc.documentType]}
                  </span>
                  <span className="text-sm text-gray-800 truncate">{doc.originalFilename}</span>
                  <span className="text-xs text-gray-400">{formatBytes(doc.fileSizeBytes)}</span>
                </div>
                {doc.note && (
                  <p className="mt-1 text-xs text-gray-500 italic">{doc.note}</p>
                )}
                <p className="mt-0.5 text-xs text-gray-400">
                  {new Date(doc.createdAt).toLocaleString()}
                </p>
              </div>
              {doc.contentType !== 'text/plain' && (
                <Button
                  variant="secondary"
                  isLoading={downloadingId === doc.id}
                  onClick={() => handleDownload(doc)}
                >
                  Download
                </Button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-400 mb-4">No documents yet.</p>
      )}

      {/* Trucker upload areas */}
      {role === 'TRUCKER' && (
        <div className="space-y-3 border-t border-gray-100 pt-4">
          {loadStatus === 'CLAIMED' && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm font-medium text-blue-900 mb-1">BOL Photo required</p>
              <p className="text-xs text-blue-700 mb-3">
                Upload a photo of the Bill of Lading before marking pickup.
                {hasBolPhoto && ' ✓ Uploaded — you can proceed.'}
              </p>
              <input
                ref={bolPhotoRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleBolFileChange}
              />
              <Button
                variant={hasBolPhoto ? 'secondary' : 'primary'}
                isLoading={isUploadingBol}
                onClick={() => bolPhotoRef.current?.click()}
              >
                {hasBolPhoto ? 'Upload Another BOL Photo' : 'Upload BOL Photo'}
              </Button>
            </div>
          )}

          {loadStatus === 'IN_TRANSIT' && (
            <>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm font-medium text-blue-900 mb-1">POD Photo required</p>
                <p className="text-xs text-blue-700 mb-3">
                  Upload a photo of the signed Proof of Delivery before marking delivered.
                  {hasPodPhoto && ' ✓ Uploaded — you can proceed.'}
                </p>
                <input
                  ref={podPhotoRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handlePodFileChange}
                />
                <Button
                  variant={hasPodPhoto ? 'secondary' : 'primary'}
                  isLoading={isUploadingPod}
                  onClick={() => podPhotoRef.current?.click()}
                >
                  {hasPodPhoto ? 'Upload Another POD Photo' : 'Upload POD Photo'}
                </Button>
              </div>

              <div>
                <Button variant="secondary" onClick={() => setShowIssueModal(true)}>
                  Report Issue
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {showIssueModal && (
        <IssueReportModal
          loadId={loadId}
          onClose={() => setShowIssueModal(false)}
        />
      )}
    </div>
  )
}
