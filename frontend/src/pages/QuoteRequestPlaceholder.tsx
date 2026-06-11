import { useNavigate } from 'react-router-dom'

export const QuoteRequestPlaceholder = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-shipper-bg p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-md border border-shipper-accent bg-shipper-surface shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Get A Quote</h1>
        <p className="text-gray-600 mb-6">
          The quote request feature is coming soon. We're building an enhanced quote management system to help you streamline your shipping requests.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-sm text-blue-900">
            <strong>Expected availability:</strong> Next sprint. Check back soon!
          </p>
        </div>
        <div className="mt-8">
          <button
            onClick={() => navigate('/dashboard/shipper')}
            className="inline-block px-4 py-2 text-white rounded-md hover:opacity-90 transition-opacity"
            style={{
              background: 'linear-gradient(180deg, #C9A46A 0%, #B08D57 45%, #8C6D3F 100%)',
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.25), inset 0 -1px 2px rgba(0,0,0,0.2), 0 2px 5px rgba(0,0,0,0.35)',
              border: '1px solid #7A5F3A',
            }}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
