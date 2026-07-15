/**
 * US-846: Action Zone Restructure
 *
 * Two-state ContextPanel from UI kit (Prototype/ui_kits/shipper/index.html).
 * Default: ⚡ ACTION ZONE — Quick Actions CTA + 2×2 grid + Preferred Carriers list
 * Load-selected: 📦 LOAD #XXXX — Load summary card + Find Carriers + Preferred Carriers (assign mode)
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { usePreferredCarriers, useRemovePreferredCarrier } from '@/features/shipper/hooks/usePreferredCarriers';
import type { Shipment } from '@/features/shipper/components/ShipmentStatusPanel';

interface ActionZoneProps {
  selectedShipment: Shipment | null;
  onClear: () => void;
}

const bronzePrimaryStyle: React.CSSProperties = {
  background: 'linear-gradient(180deg, #C9A46A 0%, #B08D57 45%, #8C6D3F 100%)',
  boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.25), inset 0 -1px 2px rgba(0,0,0,0.2), 0 2px 5px rgba(0,0,0,0.35)',
  border: '1px solid #7A5F3A',
  color: '#fff',
  width: '100%',
  padding: '10px 16px',
  borderRadius: 4,
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  textAlign: 'center' as const,
};

const statusConfig: Record<string, { label: string; color: string }> = {
  OPEN:      { label: 'POSTED',     color: '#E74C3C' },
  CLAIMED:   { label: 'CLAIMED',    color: '#F39C12' },
  IN_TRANSIT:{ label: 'IN TRANSIT', color: '#3498DB' },
  DELIVERED: { label: 'DELIVERED',  color: '#27AE60' },
};

const dividerStyle: React.CSSProperties = {
  border: 'none',
  borderTop: '1px dashed #C9A876',
  margin: '14px 0',
};

const sectionLabelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '.08em',
  color: '#9C8060',
  marginBottom: 10,
  margin: '0 0 10px 0',
};

export const ActionZone: React.FC<ActionZoneProps> = ({ selectedShipment, onClear }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const shipperId = (user as any)?.id ?? '';

  const { data: preferredCarriersRaw } = usePreferredCarriers(shipperId);
  const { mutate: removeCarrier } = useRemovePreferredCarrier(shipperId);

  const preferredCarriers: Array<{ id: string; carrierId: string; notes?: string }> =
    Array.isArray(preferredCarriersRaw?.content)
      ? preferredCarriersRaw.content
      : Array.isArray(preferredCarriersRaw)
        ? preferredCarriersRaw
        : [];

  return (
    <div
      data-testid="action-zone-container"
      style={{
        background: '#FAF6EE',
        border: '1px solid #C9A876',
        borderRadius: 10,
        boxShadow: '0 2px 8px rgba(176,141,87,.12), inset 0 1px 0 rgba(255,255,255,.9)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(180deg, #EFE5CC 0%, #E8D9BB 100%)',
          borderBottom: '1px solid #C9A876',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>{selectedShipment ? '📦' : '⚡'}</span>
          <span style={{ fontFamily: 'Sora, sans-serif', fontSize: 14, fontWeight: 700, color: '#5C4A2A', letterSpacing: '.06em' }}>
            {selectedShipment ? `LOAD #${selectedShipment.loadId}` : 'ACTION ZONE'}
          </span>
        </div>
        {selectedShipment ? (
          <button
            data-testid="action-zone-clear-btn"
            onClick={onClear}
            style={{ fontSize: 12, color: '#9C8060', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            ✕ Clear
          </button>
        ) : (
          <span style={{ fontSize: 11, color: '#9C8060' }}>Quick access</span>
        )}
      </div>

      <div style={{ padding: '14px 16px' }}>
        {selectedShipment ? (
          <LoadSelectedState
            shipment={selectedShipment}
            preferredCarriers={preferredCarriers}
            navigate={navigate}
            dividerStyle={dividerStyle}
            sectionLabelStyle={sectionLabelStyle}
          />
        ) : (
          <DefaultState
            preferredCarriers={preferredCarriers}
            navigate={navigate}
            onRemoveCarrier={(carrierId) => removeCarrier(carrierId)}
            dividerStyle={dividerStyle}
            sectionLabelStyle={sectionLabelStyle}
          />
        )}
      </div>
    </div>
  );
};

// ── Default state ──────────────────────────────────────────────────────────────

interface DefaultStateProps {
  preferredCarriers: Array<{ id: string; carrierId: string; notes?: string }>;
  navigate: ReturnType<typeof useNavigate>;
  onRemoveCarrier: (carrierId: string) => void;
  dividerStyle: React.CSSProperties;
  sectionLabelStyle: React.CSSProperties;
}

const DefaultState: React.FC<DefaultStateProps> = ({
  preferredCarriers, navigate, onRemoveCarrier, dividerStyle, sectionLabelStyle,
}) => (
  <>
    <p style={sectionLabelStyle}>Quick Actions</p>

    <button
      data-testid="action-zone-create-load"
      onClick={() => navigate('/shipper/loads/new')}
      style={{ ...bronzePrimaryStyle, marginBottom: 10 }}
    >
      + Create New Load
    </button>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {[
        { label: 'Get a Quote',    testId: 'action-zone-get-quote',          path: '/shipper/quote' },
        { label: 'Find Carriers',  testId: 'action-zone-find-carriers-grid', path: '/carriers' },
        { label: 'My Documents',   testId: 'action-zone-documents',          path: '/shipper/documents' },
        { label: 'Payments',       testId: 'action-zone-payments',           path: '/shipper/payments' },
      ].map(({ label, testId, path }) => (
        <button
          key={testId}
          data-testid={testId}
          onClick={() => navigate(path)}
          style={{
            padding: '8px 10px', fontSize: 12, fontWeight: 600,
            color: '#7A5F3A',
            background: 'linear-gradient(180deg, #FAF6EE 0%, #F0E9D8 100%)',
            border: '1px solid #C9A876', borderRadius: 4,
            cursor: 'pointer', textAlign: 'center',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,.9), inset 0 -1px 0 rgba(0,0,0,.08), 0 1px 3px rgba(0,0,0,.15)',
          }}
        >
          {label}
        </button>
      ))}
    </div>

    <hr style={dividerStyle} />

    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <p style={{ ...sectionLabelStyle, marginBottom: 0 }}>Preferred Carriers</p>
      <button
        data-testid="action-zone-manage-carriers"
        onClick={() => navigate('/carriers')}
        style={{ fontSize: 11, color: '#B08D57', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
      >
        Manage →
      </button>
    </div>
    <PreferredCarriersList
      carriers={preferredCarriers}
      mode="remove"
      onRemove={onRemoveCarrier}
    />
  </>
);

// ── Load-selected state ────────────────────────────────────────────────────────

interface LoadSelectedStateProps {
  shipment: Shipment;
  preferredCarriers: Array<{ id: string; carrierId: string; notes?: string }>;
  navigate: ReturnType<typeof useNavigate>;
  dividerStyle: React.CSSProperties;
  sectionLabelStyle: React.CSSProperties;
}

const LoadSelectedState: React.FC<LoadSelectedStateProps> = ({
  shipment, preferredCarriers, navigate, dividerStyle, sectionLabelStyle,
}) => {
  const status = statusConfig[shipment.status] ?? { label: shipment.status, color: '#636E72' };

  return (
    <>
      {/* Load summary card */}
      <div
        data-testid="action-zone-load-summary"
        style={{ background: '#fff', border: '1px solid #D9C99E', borderRadius: 8, padding: '12px 14px', marginBottom: 10 }}
      >
        <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>
          {shipment.origin
            ? `${shipment.origin} → ${shipment.destination}`
            : shipment.destination}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
            background: status.color, color: '#fff',
            textTransform: 'uppercase', letterSpacing: '.04em',
          }}>
            {status.label}
          </span>
          <span style={{ fontSize: 12, color: '#636E72' }}>{shipment.equipment}</span>
        </div>
        <div style={{ background: '#E8E3D8', borderRadius: 4, height: 6, overflow: 'hidden', marginBottom: 6 }}>
          <div style={{ background: '#B08D57', height: '100%', width: `${shipment.progress}%`, transition: 'width .3s' }} />
        </div>
        <div style={{ fontSize: 11, color: '#9C8060', textAlign: 'right', marginBottom: 12 }}>
          {shipment.progress}% complete
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            data-testid="action-zone-view-docs"
            onClick={() => navigate(`/shipper/loads/${shipment.loadId}`)}
            style={{ ...bronzePrimaryStyle, flex: 1, fontSize: 12, padding: '7px 10px' }}
          >
            View Documents
          </button>
          {shipment.status === 'OPEN' && (
            <button
              data-testid="action-zone-cancel-load"
              style={{
                flex: 1, fontSize: 12, padding: '7px 10px', borderRadius: 6,
                border: '1px solid #E74C3C', color: '#E74C3C',
                background: 'transparent', cursor: 'pointer', fontWeight: 600,
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Find Carriers CTA */}
      <button
        data-testid="action-zone-find-carriers"
        onClick={() => {
          const p = new URLSearchParams();
          // Coming from Shipment Status: filter by origin + equipment only (no destination) —
          // this is a "which carriers could reposition for this pickup" search, not a strict
          // exact-lane match, since requiring an exact destination lane on file was the cause
          // of the "no carriers ever shown" bug. State codes, not city names, match the backend
          // lane search (shipment.origin/destination remain city names for display only above).
          if (shipment.originState) p.set('origin', shipment.originState);
          if (shipment.equipment) p.set('equip', shipment.equipment);
          navigate(`/carriers?${p.toString()}`);
        }}
        style={{
          width: '100%', textAlign: 'center', padding: '9px 0', fontSize: 13,
          fontWeight: 600, color: '#7A5F3A',
          background: 'linear-gradient(180deg, #FAF6EE 0%, #F0E9D8 100%)',
          border: '1px solid #C9A876', borderRadius: 4, cursor: 'pointer',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,.9), inset 0 -1px 0 rgba(0,0,0,.08), 0 1px 3px rgba(0,0,0,.15)',
          marginBottom: 0,
        }}
      >
        Find Carriers for This Load →
      </button>

      <hr style={dividerStyle} />

      <p style={sectionLabelStyle}>Preferred Carriers</p>
      <PreferredCarriersList
        carriers={preferredCarriers}
        mode="assign"
        onAssign={(c) => navigate(`/carriers?assignTo=${shipment.loadId}&carrierId=${c.carrierId}`)}
      />
    </>
  );
};

// ── Preferred carriers list ────────────────────────────────────────────────────

interface CarrierEntry { id: string; carrierId: string; notes?: string; }

const PreferredCarriersList: React.FC<{
  carriers: CarrierEntry[];
  mode: 'remove' | 'assign';
  onRemove?: (carrierId: string) => void;
  onAssign?: (carrier: CarrierEntry) => void;
}> = ({ carriers, mode, onRemove, onAssign }) => {
  if (!carriers.length) {
    return (
      <p style={{ fontSize: 12, color: '#9C8060', textAlign: 'center', padding: '8px 0', margin: 0 }}>
        No preferred carriers yet
      </p>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {carriers.slice(0, 5).map((c) => (
        <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid #E8E3D8' }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', background: '#C9A876',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>
            {c.carrierId.slice(0, 1).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {c.carrierId}
            </div>
            {c.notes && <div style={{ fontSize: 11, color: '#9C8060' }}>{c.notes}</div>}
          </div>
          {mode === 'remove' ? (
            <button
              data-testid={`az-remove-carrier-${c.carrierId}`}
              onClick={() => onRemove?.(c.carrierId)}
              style={{ fontSize: 16, color: '#9C8060', background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', lineHeight: 1 }}
              aria-label={`Remove ${c.carrierId}`}
            >
              ×
            </button>
          ) : (
            <button
              data-testid={`az-assign-carrier-${c.carrierId}`}
              onClick={() => onAssign?.(c)}
              style={{
                fontSize: 11, fontWeight: 600, color: '#B08D57',
                background: 'transparent', border: '1px solid #C9A876',
                borderRadius: 4, padding: '3px 8px', cursor: 'pointer', flexShrink: 0,
              }}
            >
              Assign
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
