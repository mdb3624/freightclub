export type DocumentType = 'BOL_GENERATED' | 'BOL_PHOTO' | 'POD_PHOTO' | 'ISSUE_PHOTO'

export interface LoadDocument {
  id: string
  loadId: string
  documentType: DocumentType
  originalFilename: string
  contentType: string
  fileSizeBytes: number
  note: string | null
  uploadedBy: string
  createdAt: string
}

export const DOCUMENT_LABELS: Record<DocumentType, string> = {
  BOL_GENERATED: 'Bill of Lading',
  BOL_PHOTO: 'BOL Photo',
  POD_PHOTO: 'POD Photo',
  ISSUE_PHOTO: 'Issue Report',
}
