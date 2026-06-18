# 3-Column Layout Implementation for LoadForm.tsx

## Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  FORM CONTAINER (white, bronze border, cream gradient)          │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   LEFT COLUMN   │  MIDDLE COLUMN  │   RIGHT COLUMN              │
├─────────────────┼─────────────────┼─────────────────────────────┤
│ 1. ORIGIN       │ 1. CARGO &      │ 1. PAYMENT & TERMS          │
│    PANEL        │    EQUIPMENT    │    PANEL                    │
│                 │    PANEL        │                             │
│ 2. DESTINATION  │                 │ 2. SPECIAL INSTRUCTIONS     │
│    PANEL        │                 │    PANEL                    │
│                 │                 │                             │
│ 3. SCHEDULE     │                 │                             │
│    PANEL        │                 │                             │
│    (with        │                 │                             │
│     distance)   │                 │                             │
└─────────────────┴─────────────────┴─────────────────────────────┘
└─────────────── ACTION BUTTONS (bronze gradient) ──────────────┘
```

## Style Constants

```typescript
const formContainerStyle: React.CSSProperties = {
  background: '#FFFFFF',
  border: '2px solid #C9A46A',
  borderRadius: '12px',
  padding: '32px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  display: 'block',
  width: '100%',
}

const sectionPanelStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #FFFFFF 0%, #FFFBF7 100%)',
  border: '1px solid #E8E3D8',
  borderLeft: '4px solid #B08D57',
  borderRadius: '8px',
  padding: '20px',
}

const bronzeButtonStyle: React.CSSProperties = {
  background: 'linear-gradient(180deg, #C9A46A 0%, #B08D57 45%, #8C6D3F 100%)',
  boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.25), inset 0 -1px 2px rgba(0,0,0,0.2), 0 2px 5px rgba(0,0,0,0.35)',
  border: '1px solid #7A5F3A',
  color: '#FFFFFF',
  height: '44px',
  padding: '0 24px',
  borderRadius: '6px',
  fontWeight: 500,
  cursor: 'pointer',
  fontSize: '14px',
}
```

## Grid Layout JSX

Replace the form return with:

```tsx
return (
  <div style={formContainerStyle}>
    {errorMessage && <ErrorBanner message={errorMessage} />}

    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>

      {/* LEFT COLUMN: Origin, Destination, Schedule */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Origin Panel */}
        <div style={sectionPanelStyle}>
          <AddressSection prefix="origin" register={register} errors={errors} />
        </div>

        {/* Destination Panel */}
        <div style={sectionPanelStyle}>
          <AddressSection prefix="destination" register={register} errors={errors} />
        </div>

        {/* Schedule Panel */}
        <div style={sectionPanelStyle}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#374151' }}>SCHEDULE</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Earliest Pickup"
              type="datetime-local"
              error={errors.pickupFrom?.message}
              {...register('pickupFrom')}
            />
            <Input
              label="Latest Pickup"
              type="datetime-local"
              error={errors.pickupTo?.message}
              {...register('pickupTo')}
            />
            <Input
              label="Earliest Delivery"
              type="datetime-local"
              error={errors.deliveryFrom?.message}
              {...register('deliveryFrom')}
            />
            <Input
              label="Latest Delivery"
              type="datetime-local"
              error={errors.deliveryTo?.message}
              {...register('deliveryTo')}
            />
          </div>

          {/* Distance Display */}
          <div style={{ marginTop: '12px', padding: '8px 12px', backgroundColor: '#F3F4F6', borderRadius: '6px', fontSize: '13px' }}>
            {distanceLoading ? (
              <p style={{ color: '#6B7280' }}>Calculating...</p>
            ) : distanceMiles != null ? (
              <p style={{ color: '#1F2937' }}>
                <span style={{ fontWeight: 600 }}>{distanceMiles.toLocaleString()} mi</span>
                <span style={{ color: '#9CA3AF', marginLeft: '4px' }}>(estimated)</span>
              </p>
            ) : (
              <p style={{ color: '#9CA3AF' }}>Distance will calculate when both addresses are filled</p>
            )}
            {distanceError && <p style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{distanceError}</p>}
          </div>
        </div>
      </div>

      {/* MIDDLE COLUMN: Cargo & Equipment */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={sectionPanelStyle}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#374151' }}>CARGO & EQUIPMENT</h3>

          <div style={{ marginBottom: '12px' }}>
            <Input
              label="Commodity"
              error={errors.commodity?.message}
              placeholder="e.g. Steel coils, Electronics"
              {...register('commodity')}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <Input
              label="Weight (lbs)"
              type="number"
              error={errors.weightLbs?.message}
              step="0.01"
              min="0.01"
              {...register('weightLbs', { valueAsNumber: true })}
            />
            <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>Legal max: 80,000 lbs</p>
            {isOverweight && (
              <div style={{ marginTop: '8px', padding: '12px', backgroundColor: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '6px' }}>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#92400E' }}>Exceeds federal limit. Confirm special permit required.</p>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    style={{ cursor: 'pointer' }}
                    {...register('overweightAcknowledged')}
                  />
                  <span style={{ fontSize: '12px', color: '#92400E' }}>Confirm special permit</span>
                </label>
              </div>
            )}
          </div>

          {/* Dimensions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            {(['Length', 'Width', 'Height'] as const).map((label) => {
              const ftKey = `${label.toLowerCase()}Ft` as 'lengthFt' | 'widthFt' | 'heightFt'
              const inKey = `${label.toLowerCase()}In` as 'lengthIn' | 'widthIn' | 'heightIn'
              return (
                <div key={label}>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>{label}</span>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <input type="number" min="0" placeholder="ft" style={{ flex: 1, padding: '8px', border: '1px solid #D1D5DB', borderRadius: '4px' }} {...register(ftKey, { setValueAs: v => v === '' ? '' : Number(v) })} />
                    <input type="number" min="0" max="11" placeholder="in" style={{ flex: 1, padding: '8px', border: '1px solid #D1D5DB', borderRadius: '4px' }} {...register(inKey, { setValueAs: v => v === '' ? '' : Number(v) })} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Payment & Terms, Special Instructions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Payment & Terms Panel */}
        <div style={sectionPanelStyle}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#374151' }}>PAYMENT & TERMS</h3>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Equipment Type</label>
            <select className={selectClass} {...register('equipmentType')}>
              <option value="DRY_VAN">Dry Van</option>
              <option value="FLATBED">Flatbed</option>
              <option value="REEFER">Reefer</option>
              <option value="STEP_DECK">Step Deck</option>
            </select>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Pay Rate Type</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['FLAT_RATE', 'PER_MILE'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setValue('payRateType', type)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    fontSize: '12px',
                    fontWeight: 500,
                    borderRadius: '4px',
                    border: payRateType === type ? '2px solid #B08D57' : '1px solid #D1D5DB',
                    backgroundColor: payRateType === type ? '#FFFBF7' : '#F9FAFB',
                    cursor: 'pointer',
                  }}
                >
                  {type === 'FLAT_RATE' ? 'Flat Rate' : 'Per Mile'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Pay Rate ($)</label>
            <input type="number" step="0.01" min="0.01" style={{ width: '100%', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '4px' }} {...register('payRate', { valueAsNumber: true })} />
            <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>
              {payRateType === 'PER_MILE' && distanceMiles
                ? `≈ $${(payRate * distanceMiles).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : `Per ${payRateType === 'PER_MILE' ? 'mile' : 'load'}`}
            </p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Payment Terms</label>
            <select className={selectClass} {...register('paymentTerms')}>
              <option value="">Not specified</option>
              <option value="QUICK_PAY">Quick Pay</option>
              <option value="NET_7">Net 7</option>
              <option value="NET_15">Net 15</option>
              <option value="NET_30">Net 30</option>
            </select>
          </div>
        </div>

        {/* Special Instructions Panel */}
        <div style={sectionPanelStyle}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#374151' }}>SPECIAL INSTRUCTIONS</h3>
          <textarea
            rows={4}
            style={{ width: '100%', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '13px' }}
            placeholder="Any special handling, hazmat requirements, gate hours, etc. (optional)"
            {...register('specialRequirements')}
          />
        </div>
      </div>
    </form>

    {/* Action Buttons */}
    <div style={{ display: 'flex', gap: '12px', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #E5E7EB', justifyContent: 'flex-end' }}>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          style={{ ...bronzeButtonStyle, opacity: 0.9 }}
        >
          Cancel
        </button>
      )}
      {onSaveDraft && (
        <button
          type="button"
          onClick={handleSubmit(onSaveDraft)}
          disabled={isDraftSaving}
          style={bronzeButtonStyle}
        >
          {isDraftSaving ? 'Saving...' : 'Save as Draft'}
        </button>
      )}
      <button
        type="submit"
        onClick={handleSubmit(onSubmit)}
        disabled={isSubmitting || (isOverweight && !overweightAcknowledged)}
        style={bronzeButtonStyle}
      >
        {isSubmitting ? 'Creating...' : submitLabel}
      </button>
    </div>
  </div>
)
```

## Key Changes
- 3-column semantic grid layout
- Section panels with cream gradient background and bronze left border
- Bronze gradient buttons at the bottom
- Full-width form container with white background and bronze border
- Distance calculator integrated into Schedule panel
- Proper spacing and typography per Shipper Style Guide
- Responsive design with Tailwind media queries for smaller screens
