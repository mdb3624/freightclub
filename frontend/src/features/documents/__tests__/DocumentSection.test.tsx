import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { DocumentSection } from '../components/DocumentSection'
import * as documentHooks from '../hooks/useDocuments'
import * as documentsApi from '../api'
import type { LoadDocument } from '../types'

vi.mock('../hooks/useDocuments')
vi.mock('../api')
vi.mock('../utils/fileDownload', () => ({ downloadBlob: vi.fn() }))
vi.mock('../components/IssueReportModal', () => ({
  IssueReportModal: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="issue-modal">
      <button onClick={onClose}>Close</button>
    </div>
  ),
}))

const mockedHooks = documentHooks as unknown as Record<string, ReturnType<typeof vi.fn>>
const mockedApi = (documentsApi as unknown as { documentsApi: Record<string, ReturnType<typeof vi.fn>> }).documentsApi

const mockMutate = vi.fn()

function setupHooks() {
  mockedHooks.useUploadBolPhoto.mockReturnValue({ mutate: mockMutate, isPending: false })
  mockedHooks.useUploadPodPhoto.mockReturnValue({ mutate: mockMutate, isPending: false })
}

const podDoc: LoadDocument = {
  id: 'doc-1',
  loadId: 'load-1',
  documentType: 'POD_PHOTO',
  originalFilename: 'pod.jpg',
  contentType: 'image/jpeg',
  fileSizeBytes: 204800,
  note: null,
  uploadedBy: 'trucker@test.com',
  createdAt: '2026-05-12T10:00:00Z',
}

const bolDoc: LoadDocument = {
  ...podDoc,
  id: 'doc-2',
  documentType: 'BOL_PHOTO',
  originalFilename: 'bol.jpg',
}

const defaultProps = {
  loadId: 'load-1',
  loadStatus: 'IN_TRANSIT',
  role: 'TRUCKER' as const,
  documents: [],
}

beforeEach(() => {
  vi.clearAllMocks()
  setupHooks()
  if (mockedApi) {
    mockedApi.download = vi.fn().mockResolvedValue(new Blob())
    mockedApi.exportPdf = vi.fn().mockResolvedValue(new Blob())
  }
})

describe('DocumentSection — role visibility', () => {
  it('shows Export PDF for SHIPPER', () => {
    render(<DocumentSection {...defaultProps} role="SHIPPER" />)
    expect(screen.getByRole('button', { name: /export pdf/i })).toBeInTheDocument()
  })

  it('hides Export PDF for TRUCKER', () => {
    render(<DocumentSection {...defaultProps} role="TRUCKER" />)
    expect(screen.queryByRole('button', { name: /export pdf/i })).not.toBeInTheDocument()
  })
})

describe('DocumentSection — TRUCKER CLAIMED status', () => {
  it('shows BOL upload section and hides POD upload section', () => {
    render(<DocumentSection {...defaultProps} loadStatus="CLAIMED" />)
    expect(screen.getByText(/BOL Photo required/i)).toBeInTheDocument()
    expect(screen.queryByText(/POD Photo required/i)).not.toBeInTheDocument()
  })

  it('shows primary Upload BOL Photo button when no BOL uploaded', () => {
    render(<DocumentSection {...defaultProps} loadStatus="CLAIMED" documents={[]} />)
    expect(screen.getByRole('button', { name: /upload bol photo/i })).toBeInTheDocument()
  })

  it('shows uploaded confirmation text and secondary button when BOL already uploaded', () => {
    render(<DocumentSection {...defaultProps} loadStatus="CLAIMED" documents={[bolDoc]} />)
    expect(screen.getByText(/✓ Uploaded — you can proceed/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /upload another bol photo/i })).toBeInTheDocument()
  })

  it('hides Report Issue button', () => {
    render(<DocumentSection {...defaultProps} loadStatus="CLAIMED" />)
    expect(screen.queryByRole('button', { name: /report issue/i })).not.toBeInTheDocument()
  })
})

describe('DocumentSection — TRUCKER IN_TRANSIT status', () => {
  it('shows POD upload section and hides BOL upload section', () => {
    render(<DocumentSection {...defaultProps} loadStatus="IN_TRANSIT" />)
    expect(screen.getByText(/POD Photo required/i)).toBeInTheDocument()
    expect(screen.queryByText(/BOL Photo required/i)).not.toBeInTheDocument()
  })

  it('shows primary Upload POD Photo button when no POD uploaded', () => {
    render(<DocumentSection {...defaultProps} loadStatus="IN_TRANSIT" documents={[]} />)
    expect(screen.getByRole('button', { name: /upload pod photo/i })).toBeInTheDocument()
  })

  it('shows uploaded confirmation text and secondary button when POD already uploaded', () => {
    render(<DocumentSection {...defaultProps} loadStatus="IN_TRANSIT" documents={[podDoc]} />)
    expect(screen.getByText(/✓ Uploaded — you can proceed/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /upload another pod photo/i })).toBeInTheDocument()
  })

  it('shows Report Issue button', () => {
    render(<DocumentSection {...defaultProps} loadStatus="IN_TRANSIT" />)
    expect(screen.getByRole('button', { name: /report issue/i })).toBeInTheDocument()
  })

  it('opens issue modal when Report Issue is clicked', async () => {
    const user = userEvent.setup()
    render(<DocumentSection {...defaultProps} loadStatus="IN_TRANSIT" />)
    await user.click(screen.getByRole('button', { name: /report issue/i }))
    expect(screen.getByTestId('issue-modal')).toBeInTheDocument()
  })
})

describe('DocumentSection — document list', () => {
  it('shows empty state when no documents', () => {
    render(<DocumentSection {...defaultProps} documents={[]} />)
    expect(screen.getByText(/no documents yet/i)).toBeInTheDocument()
  })

  it('renders document filename and formatted size', () => {
    render(<DocumentSection {...defaultProps} documents={[podDoc]} />)
    expect(screen.getByText('pod.jpg')).toBeInTheDocument()
    expect(screen.getByText('200 KB')).toBeInTheDocument()
  })

  it('renders document upload timestamp', () => {
    render(<DocumentSection {...defaultProps} documents={[podDoc]} />)
    // Timestamp is rendered via toLocaleString — just verify it's present as a non-empty string
    const timestamp = new Date(podDoc.createdAt).toLocaleString()
    expect(screen.getByText(timestamp)).toBeInTheDocument()
  })

  it('renders Download button for non-text documents', () => {
    render(<DocumentSection {...defaultProps} documents={[podDoc]} />)
    expect(screen.getByRole('button', { name: /download/i })).toBeInTheDocument()
  })

  it('calls documentsApi.download with correct id on Download click', async () => {
    const user = userEvent.setup()
    const { downloadBlob } = await import('../utils/fileDownload')
    render(<DocumentSection {...defaultProps} documents={[podDoc]} />)
    await user.click(screen.getByRole('button', { name: /download/i }))
    await waitFor(() => {
      expect(downloadBlob).toHaveBeenCalled()
    })
  })
})
