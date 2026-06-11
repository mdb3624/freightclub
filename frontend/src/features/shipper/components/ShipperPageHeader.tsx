/**
 * ShipperPageHeader: Mandatory header for all Shipper pages
 *
 * Displays:
 * - FreightClub logo + branding
 * - "Integrated Logistics" tagline
 * - Last updated timestamp
 *
 * Required in all Shipper pages via ShipperPageLayout
 */

export function ShipperPageHeader() {
  const now = new Date()
  const lastUpdated = now.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div
      className="panel-header"
      data-testid="shipper-page-header"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 'var(--space-lg)',
        marginBottom: 0,
      }}
    >
      {/* Left: Logo + Branding */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-md)',
        }}
      >
        <img src="/logo.png" alt="FreightClub" style={{ height: '40px' }} />
        <div>
          <h1 className="panel-title" style={{ marginBottom: 0, fontSize: 'var(--font-size-lg)' }}>
            FreightClub
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-secondary)',
              fontWeight: 'var(--font-weight-regular)',
            }}
          >
            Integrated Logistics
          </p>
        </div>
      </div>

      {/* Right: Last Updated */}
      <div
        style={{
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-tertiary)',
          textAlign: 'right',
        }}
      >
        <p style={{ margin: 0, marginBottom: 'var(--space-xs)' }}>Last updated</p>
        <p style={{ margin: 0, fontWeight: 'var(--font-weight-semibold)' }}>{lastUpdated}</p>
      </div>
    </div>
  )
}
