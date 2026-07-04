/**
 * US-848: Carrier Network Page
 * AC-1: ShipperPageLayout wrapper; URL params pre-populate filters on mount
 * AC-2: Search/Clear filter actions
 * AC-3: Preferred Carriers strip
 * AC-4: Carrier cards with stats, equipment tags, action buttons
 * AC-5: Slide-in detail panel
 * AC-6: Add/Remove preferred toggle
 * AC-7: Empty state
 * AC-8: Breadcrumb + back navigation
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShipperPageLayout } from '@/features/shipper/components/ShipperPageLayout';
import { useCarrierSearch, type CarrierSearchResult } from '@/features/shipper/hooks/useCarrierSearch';
import { usePreferredCarriers, useAddPreferredCarrier, useRemovePreferredCarrier } from '@/features/shipper/hooks/usePreferredCarriers';
import { useCarrierProfile } from '@/features/carriers/hooks/useCarrierProfile';
import { useAuthStore } from '@/store/authStore';

// ── Types ────────────────────────────────────────────────────────────────────

interface Filters {
  origin: string;
  dest: string;
  equip: string;
  minRating: number;
  minOnTime: number;
  preferredOnly: boolean;
}

const DEFAULT_FILTERS: Filters = {
  origin: '',
  dest: '',
  equip: '',
  minRating: 0,
  minOnTime: 0,
  preferredOnly: false,
};

const ORIGIN_STATES = ['TX', 'CA', 'FL', 'IL', 'AZ', 'CO', 'OR', 'NY', 'TN', 'PA'];
const DEST_STATES   = ['TX', 'CA', 'FL', 'IL', 'AZ', 'CO', 'WA', 'NY', 'GA', 'TN'];
const EQUIP_TYPES   = ['Dry Van', 'Flatbed', 'Reefer', 'Box Truck', 'Step Deck'];

// ── Styles ───────────────────────────────────────────────────────────────────

const bronzePrimaryStyle: React.CSSProperties = {
  background: 'linear-gradient(180deg, #C9A46A 0%, #B08D57 45%, #8C6D3F 100%)',
  boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.25), inset 0 -1px 2px rgba(0,0,0,0.2), 0 2px 5px rgba(0,0,0,0.35)',
  border: '1px solid #7A5F3A',
  color: '#fff',
  borderRadius: 4,
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'all 150ms',
};

const bronzeSecondaryStyle: React.CSSProperties = {
  background: 'linear-gradient(180deg, #FAF6EE 0%, #F0E9D8 100%)',
  border: '1px solid #C9A876',
  color: '#7A5F3A',
  borderRadius: 4,
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 150ms',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,.9), inset 0 -1px 0 rgba(0,0,0,.08), 0 1px 3px rgba(0,0,0,.15)',
};

const panelStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #D0D0D0',
  borderRadius: 8,
  boxShadow: '0 2px 4px rgba(0,0,0,.05)',
};

const statBoxStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: 10,
  background: '#FAF6EE',
  borderRadius: 6,
  border: '1px solid #E8E3D8',
};

const equipTagStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: 9999,
  fontSize: 11,
  fontWeight: 600,
  background: '#F5F0E8',
  border: '1px solid #C9A876',
  color: '#7A5F3A',
};

const laneTagStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: 9999,
  fontSize: 11,
  fontWeight: 500,
  background: '#F1F5F9',
  color: '#475569',
  border: '1px solid #CBD5E1',
};

// ── Sub-components ────────────────────────────────────────────────────────────

function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const sz = { sm: { w: 32, f: 11 }, md: { w: 44, f: 15 }, lg: { w: 56, f: 19 } }[size];
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || '?';
  return (
    <div
      aria-hidden="true"
      style={{
        width: sz.w, height: sz.w, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: sz.f, flexShrink: 0, userSelect: 'none',
        background: '#fff', color: '#1A1A1A',
        border: '2px solid #B08D57',
        boxShadow: '0 0 0 2px #B08D57, 0 2px 6px rgba(176,141,87,.4)',
      }}
    >
      {initials}
    </div>
  );
}

function Stars({ rating, count }: { rating?: number; count?: number }) {
  const n = rating ? Math.round(rating) : 0;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <span>
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} style={{ color: i <= n ? '#F59E0B' : '#E8E3D8', fontSize: 13 }} aria-hidden="true">★</span>
        ))}
      </span>
      {rating != null && <span style={{ fontSize: 13, color: '#1A1A1A', fontWeight: 600 }}>{rating.toFixed(1)}</span>}
      {count != null && <span style={{ fontSize: 12, color: '#9CA3AF' }}>({count})</span>}
    </span>
  );
}

// ── Filter Sidebar ────────────────────────────────────────────────────────────

interface FilterSidebarProps {
  filters: Filters;
  onChange: (key: keyof Filters, val: string | number | boolean) => void;
  onSearch: () => void;
  onClear: () => void;
}

function FilterSidebar({ filters, onChange, onSearch, onClear }: FilterSidebarProps) {
  const filterLabelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '.07em', color: '#636E72', marginBottom: 8, display: 'block',
  };

  function ToggleBtn({ value, active, testId, children }: { value: number; active: boolean; testId: string; children: React.ReactNode }) {
    return (
      <button
        data-testid={testId}
        onClick={() => onChange('minRating', value)}
        style={{
          flex: 1, padding: '5px 0', fontSize: 12, fontWeight: 600, borderRadius: 4, cursor: 'pointer',
          border: `1px solid ${active ? '#B08D57' : '#D0D0D0'}`,
          background: active ? 'linear-gradient(180deg,#FAF6EE,#F0E9D8)' : '#fff',
          color: active ? '#7A5F3A' : '#636E72',
          transition: 'all 120ms',
        }}
      >
        {children}
      </button>
    );
  }

  function OnTimeBtn({ value, active, testId, children }: { value: number; active: boolean; testId: string; children: React.ReactNode }) {
    return (
      <button
        data-testid={testId}
        onClick={() => onChange('minOnTime', value)}
        style={{
          flex: 1, padding: '5px 0', fontSize: 11, fontWeight: 600, borderRadius: 4, cursor: 'pointer',
          border: `1px solid ${active ? '#B08D57' : '#D0D0D0'}`,
          background: active ? 'linear-gradient(180deg,#FAF6EE,#F0E9D8)' : '#fff',
          color: active ? '#7A5F3A' : '#636E72',
          transition: 'all 120ms',
        }}
      >
        {children}
      </button>
    );
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 11, fontWeight: 600, color: '#9C8060',
    textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4,
  };
  const selectStyle: React.CSSProperties = {
    height: 36, padding: '6px 10px', border: '1px solid #D0D0D0', borderRadius: 4,
    fontSize: 13, background: '#fff', width: '100%', outline: 'none',
  };

  return (
    <aside style={{ width: 240, flexShrink: 0 }}>
      <div style={{ ...panelStyle, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 700, color: '#1A1A1A' }}>
          Search Filters
        </div>

        <div>
          <label htmlFor="filter-origin" style={labelStyle}>Origin state</label>
          <select
            id="filter-origin"
            data-testid="filter-origin"
            value={filters.origin}
            onChange={(e) => onChange('origin', e.target.value)}
            style={selectStyle}
          >
            <option value="">Any origin</option>
            {ORIGIN_STATES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="filter-dest" style={labelStyle}>Destination state</label>
          <select
            id="filter-dest"
            data-testid="filter-dest"
            value={filters.dest}
            onChange={(e) => onChange('dest', e.target.value)}
            style={selectStyle}
          >
            <option value="">Any destination</option>
            {DEST_STATES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="filter-equip" style={labelStyle}>Equipment type</label>
          <select
            id="filter-equip"
            data-testid="filter-equip"
            value={filters.equip}
            onChange={(e) => onChange('equip', e.target.value)}
            style={selectStyle}
          >
            <option value="">Any equipment</option>
            {EQUIP_TYPES.map((e) => <option key={e}>{e}</option>)}
          </select>
        </div>

        <div style={{ borderTop: '1px solid #E8E3D8', paddingTop: 16 }}>
          <span style={filterLabelStyle}>Min. Rating</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {([0, 3, 4, 4.5] as const).map((r) => (
              <ToggleBtn key={r} value={r} active={filters.minRating === r} testId={`filter-rating-${r}`}>
                {r === 0 ? 'Any' : `${r}★`}
              </ToggleBtn>
            ))}
          </div>
        </div>

        <div>
          <span style={filterLabelStyle}>Min. On-Time Rate</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {([0, 90, 95, 99] as const).map((r) => (
              <OnTimeBtn key={r} value={r} active={filters.minOnTime === r} testId={`filter-ontime-${r}`}>
                {r === 0 ? 'Any' : `${r}%+`}
              </OnTimeBtn>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 4 }}>
          <input
            type="checkbox"
            id="filter-preferred-only"
            data-testid="filter-preferred-only"
            checked={filters.preferredOnly}
            onChange={(e) => onChange('preferredOnly', e.target.checked)}
            style={{ width: 16, height: 16, accentColor: '#B08D57' }}
          />
          <label
            htmlFor="filter-preferred-only"
            style={{ textTransform: 'none', letterSpacing: 0, fontSize: 13, color: '#1A1A1A', fontWeight: 500, cursor: 'pointer', margin: 0 }}
          >
            Preferred carriers only
          </label>
        </div>

        <button
          data-testid="search-carriers-btn"
          onClick={onSearch}
          style={{ ...bronzePrimaryStyle, padding: '10px 0', fontSize: 14, width: '100%' }}
        >
          Search Carriers
        </button>

        <button
          data-testid="clear-filters-btn"
          onClick={onClear}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 12, color: '#9CA3AF', fontWeight: 600,
            textAlign: 'center', padding: '4px 0',
          }}
        >
          Clear filters
        </button>
      </div>
    </aside>
  );
}

// ── Carrier Card ──────────────────────────────────────────────────────────────

interface CarrierCardProps {
  carrier: CarrierSearchResult;
  isSelected: boolean;
  isPreferred: boolean;
  onSelect: (carrier: CarrierSearchResult) => void;
  onTogglePreferred: (carrierId: string) => void;
  onGetQuote: (carrierId: string) => void;
}

function CarrierCard({ carrier, isSelected, isPreferred, onSelect, onTogglePreferred, onGetQuote }: CarrierCardProps) {
  const onTimeFmt = carrier.onTimePct != null ? `${carrier.onTimePct}%` : '—';

  return (
    <div
      data-testid={`carrier-card-${carrier.id}`}
      role="button"
      aria-pressed={isSelected}
      aria-label={`${carrier.companyName} carrier`}
      onClick={() => onSelect(carrier)}
      style={{
        background: '#fff',
        border: isSelected ? '2px solid #B08D57' : '1px solid #D0D0D0',
        borderRadius: 8,
        boxShadow: isSelected
          ? '0 4px 12px rgba(176,141,87,.2)'
          : '0 2px 4px rgba(0,0,0,.05)',
        padding: 16,
        cursor: 'pointer',
        transition: 'all 150ms',
        position: 'relative',
      }}
    >
      {isPreferred && (
        <span
          data-testid={`preferred-badge-${carrier.id}`}
          style={{
            position: 'absolute', top: 10, right: 10,
            background: 'linear-gradient(135deg, #C9A46A, #8C6D3F)',
            color: '#fff', fontSize: 10, fontWeight: 700,
            padding: '2px 8px', borderRadius: 9999,
          }}
        >
          ★ Preferred
        </span>
      )}

      {/* Name + avatar row */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
        <Avatar name={carrier.companyName} size="md" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>
            {carrier.companyName}
          </div>
          <Stars />
        </div>
      </div>

      {/* Stat boxes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
        <div style={statBoxStyle} data-testid={`stat-ontime-${carrier.id}`}>
          <span style={{ fontFamily: 'Sora, sans-serif', fontSize: 20, fontWeight: 900, color: '#27AE60', display: 'block' }}>
            {onTimeFmt}
          </span>
          <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: '#9C8060', display: 'block', marginTop: 2 }}>
            On-Time
          </span>
        </div>
        <div style={statBoxStyle} data-testid={`stat-loads-${carrier.id}`}>
          <span style={{ fontFamily: 'Sora, sans-serif', fontSize: 20, fontWeight: 900, color: '#1A1A1A', display: 'block' }}>—</span>
          <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: '#9C8060', display: 'block', marginTop: 2 }}>
            Loads
          </span>
        </div>
        <div style={statBoxStyle} data-testid={`stat-member-${carrier.id}`}>
          <span style={{ fontFamily: 'Sora, sans-serif', fontSize: 14, fontWeight: 900, color: '#1A1A1A', display: 'block' }}>—</span>
          <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: '#9C8060', display: 'block', marginTop: 2 }}>
            Member
          </span>
        </div>
      </div>

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
        {carrier.equipmentTypes.map((e) => (
          <span key={e} style={equipTagStyle} data-testid={`equip-tag-${e.replace(/\s+/g, '-')}`}>{e}</span>
        ))}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          data-testid={`get-quote-btn-${carrier.id}`}
          onClick={(e) => { e.stopPropagation(); onGetQuote(carrier.id); }}
          style={{ ...bronzePrimaryStyle, flex: 1, padding: '8px 0', fontSize: 13 }}
        >
          Get Quote
        </button>
        <button
          data-testid={`toggle-preferred-btn-${carrier.id}`}
          onClick={(e) => { e.stopPropagation(); onTogglePreferred(carrier.id); }}
          style={{ ...bronzeSecondaryStyle, flex: 1, padding: '8px 0', fontSize: 13 }}
        >
          {isPreferred ? '★ Preferred' : '☆ Add Preferred'}
        </button>
      </div>
    </div>
  );
}

// ── Detail Panel ──────────────────────────────────────────────────────────────

interface DetailPanelProps {
  carrier: CarrierSearchResult | null;
  isPreferred: boolean;
  onClose: () => void;
  onTogglePreferred: (carrierId: string) => void;
  onAssign: (carrierId: string) => void;
  onQuote: (carrierId: string) => void;
}

function DetailPanel({ carrier, isPreferred, onClose, onTogglePreferred, onAssign, onQuote }: DetailPanelProps) {
  const { data: profile } = useCarrierProfile(carrier?.id ?? '');

  const lanes = profile?.lanes?.map((l) => `${l.originRegion}→${l.destinationRegion}`) ?? [];
  const equipment = profile?.equipment?.map((e) => e.equipmentType) ?? carrier?.equipmentTypes ?? [];
  const isAvailable = profile?.availability?.isActive;

  return (
    <div
      data-testid="carrier-detail-panel"
      role="complementary"
      aria-label={carrier ? `${carrier.companyName} profile` : 'Carrier details'}
      style={{
        position: 'fixed', right: 0, top: 64, bottom: 0, width: 400,
        background: '#fff', borderLeft: '1px solid #D0D0D0',
        boxShadow: '-4px 0 20px rgba(0,0,0,.08)',
        overflowY: 'auto', zIndex: 20,
        transform: carrier ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 300ms ease',
      }}
    >
      {carrier && (
        <>
          {/* Sticky header */}
          <div style={{
            padding: 20, borderBottom: '1px solid #E8E3D8',
            background: '#FAF6EE', position: 'sticky', top: 0, zIndex: 1,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <button
                data-testid="close-detail-panel-btn"
                onClick={onClose}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#9CA3AF', fontWeight: 600 }}
              >
                ✕ Close
              </button>
              <button
                data-testid="detail-preferred-btn"
                onClick={() => onTogglePreferred(carrier.id)}
                style={{ ...bronzeSecondaryStyle, padding: '5px 12px', fontSize: 12 }}
              >
                {isPreferred ? '★ Preferred' : '☆ Add to Preferred'}
              </button>
            </div>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <Avatar name={carrier.companyName} size="lg" />
              <div>
                <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 700, color: '#1A1A1A' }}>
                  {carrier.companyName}
                </div>
                <Stars />
                <div style={{ fontSize: 12, color: '#636E72', marginTop: 4 }}>
                  {isAvailable != null ? (isAvailable ? '✓ Available' : '✗ Unavailable') : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <p style={{ fontSize: 13, color: '#4A5568', lineHeight: 1.6 }}>
              {carrier.email}
            </p>

            {/* Stats 2×2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={statBoxStyle}>
                <span style={{ fontFamily: 'Sora, sans-serif', fontSize: 20, fontWeight: 900, color: '#27AE60', display: 'block' }}>
                  {carrier.onTimePct != null ? `${carrier.onTimePct}%` : '—'}
                </span>
                <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: '#9C8060', display: 'block', marginTop: 2 }}>On-Time Rate</span>
              </div>
              <div style={statBoxStyle}>
                <span style={{ fontFamily: 'Sora, sans-serif', fontSize: 20, fontWeight: 900, color: '#1A1A1A', display: 'block' }}>—</span>
                <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: '#9C8060', display: 'block', marginTop: 2 }}>Loads Completed</span>
              </div>
              <div style={statBoxStyle}>
                <span style={{ fontFamily: 'Sora, sans-serif', fontSize: 20, fontWeight: 900, color: '#1A1A1A', display: 'block' }}>—</span>
                <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: '#9C8060', display: 'block', marginTop: 2 }}>Avg. Rating</span>
              </div>
              <div style={statBoxStyle}>
                <span style={{ fontFamily: 'Sora, sans-serif', fontSize: 20, fontWeight: 900, color: '#1A1A1A', display: 'block' }}>—</span>
                <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: '#9C8060', display: 'block', marginTop: 2 }}>Total Reviews</span>
              </div>
            </div>

            {/* Equipment & Lanes */}
            {(equipment.length > 0 || lanes.length > 0) && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: '#636E72', marginBottom: 8 }}>
                  EQUIPMENT & LANES
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {equipment.map((e) => <span key={e} style={equipTagStyle}>{e}</span>)}
                  {lanes.map((l) => <span key={l} style={laneTagStyle}>{l}</span>)}
                </div>
              </div>
            )}

            {/* CTAs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 8, borderTop: '1px solid #E8E3D8' }}>
              <button
                data-testid="assign-to-load-btn"
                onClick={() => onAssign(carrier.id)}
                style={{ ...bronzePrimaryStyle, padding: '11px 0', fontSize: 14, width: '100%' }}
              >
                Assign to Load
              </button>
              <button
                data-testid="request-quote-btn"
                onClick={() => onQuote(carrier.id)}
                style={{ ...bronzeSecondaryStyle, padding: '9px 0', fontSize: 13, width: '100%' }}
              >
                Request Quote
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Preferred Carriers Strip ──────────────────────────────────────────────────

interface PreferredStripProps {
  preferredIds: string[];
  carriers: CarrierSearchResult[];
  selectedId?: string;
  onSelect: (carrierId: string) => void;
}

function PreferredCarriersStrip({ preferredIds, carriers, selectedId, onSelect }: PreferredStripProps) {
  if (preferredIds.length === 0) return null;

  // Build display items — use search result data if available, fallback to ID-only display
  const items = preferredIds.map((pid) => {
    const found = carriers.find((c) => c.id === pid);
    return { id: pid, name: found?.companyName ?? pid, onTimePct: found?.onTimePct };
  });

  return (
    <div style={{ ...panelStyle, padding: 16, marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: '#636E72' }}>
          YOUR PREFERRED CARRIERS
        </div>
        <span style={{ fontSize: 12, color: '#9CA3AF' }}>{preferredIds.length} saved</span>
      </div>
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
        {items.map((item) => (
          <div
            key={item.id}
            data-testid={`preferred-strip-${item.id}`}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(item.id)}
            onKeyDown={(e) => e.key === 'Enter' && onSelect(item.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 12px', background: '#FAF6EE',
              border: `1px solid ${selectedId === item.id ? '#B08D57' : '#C9A876'}`,
              borderRadius: 8, cursor: 'pointer', flexShrink: 0,
            }}
          >
            <Avatar name={item.name} size="sm" />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', whiteSpace: 'nowrap' }}>
                {item.name}
              </div>
              <div style={{ fontSize: 11, color: '#636E72' }}>
                {item.onTimePct != null ? `${item.onTimePct}% on-time` : '—'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function CarrierNetworkPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const shipperId = (user as any)?.id ?? '';

  const [filters, setFilters] = useState<Filters>({
    ...DEFAULT_FILTERS,
    origin: searchParams.get('origin') ?? '',
    dest:   searchParams.get('dest')   ?? '',
    equip:  searchParams.get('equip')  ?? '',
  });
  const [carriers, setCarriers] = useState<CarrierSearchResult[]>([]);
  const [selectedCarrier, setSelectedCarrier] = useState<CarrierSearchResult | null>(null);
  const [preferredIds, setPreferredIds] = useState<Set<string>>(new Set());
  const [hasSearched, setHasSearched] = useState(false);

  const { mutate: searchCarriers, isPending: isSearching } = useCarrierSearch();
  const { data: preferredRaw } = usePreferredCarriers(shipperId);
  const { mutate: addPreferred } = useAddPreferredCarrier(shipperId);
  const { mutate: removePreferred } = useRemovePreferredCarrier(shipperId);

  // Hydrate preferred IDs from backend
  useEffect(() => {
    const rawList = Array.isArray(preferredRaw?.content)
      ? preferredRaw.content
      : Array.isArray(preferredRaw)
        ? preferredRaw
        : [];
    setPreferredIds(new Set(rawList.map((p: { carrierId: string }) => p.carrierId)));
  }, [preferredRaw]);

  const runSearch = useCallback((f: Filters) => {
    searchCarriers(
      { origin: f.origin, destination: f.dest, equipmentType: f.equip || undefined },
      {
        onSuccess: (results) => {
          let filtered = results;
          if (f.preferredOnly) filtered = filtered.filter((c) => preferredIds.has(c.id));
          if (f.minOnTime > 0) filtered = filtered.filter((c) => (c.onTimePct ?? 0) >= f.minOnTime);
          // minRating is a no-op: backend does not yet expose carrier rating aggregates (see US-848 Out of Scope)
          setCarriers(filtered);
          setHasSearched(true);
        },
        onError: () => {
          setCarriers([]);
          setHasSearched(true);
        },
      },
    );
  }, [searchCarriers, preferredIds]);

  // AC-1 (per Prototype/ui_kits/shipper/carrier-network.html — source of truth): URL params
  // only pre-populate the filter sidebar (already done via the `filters` initial state above).
  // The initial view always shows every carrier, unfiltered; the shipper clicks "Search
  // Carriers" to apply origin/destination/equipment. Do NOT auto-filter on mount.
  useEffect(() => {
    runSearch(DEFAULT_FILTERS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only on mount

  function handleFilterChange(key: keyof Filters, val: string | number | boolean) {
    setFilters((f) => ({ ...f, [key]: val }));
  }

  function handleSearch() {
    runSearch(filters);
  }

  function handleClear() {
    setFilters(DEFAULT_FILTERS);
    runSearch(DEFAULT_FILTERS);
  }

  function handleTogglePreferred(carrierId: string) {
    if (preferredIds.has(carrierId)) {
      setPreferredIds((s) => { const n = new Set(s); n.delete(carrierId); return n; });
      removePreferred(carrierId);
    } else {
      setPreferredIds((s) => new Set(s).add(carrierId));
      addPreferred({ carrierId });
    }
    // Update selected carrier preferred state in detail panel if open
    if (selectedCarrier?.id === carrierId) {
      // panel re-renders from preferredIds set
    }
  }

  function handleSelectCarrier(carrier: CarrierSearchResult) {
    setSelectedCarrier((prev) => prev?.id === carrier.id ? null : carrier);
  }

  function handleSelectFromStrip(carrierId: string) {
    const found = carriers.find((c) => c.id === carrierId);
    if (found) setSelectedCarrier(found);
    else setSelectedCarrier({ id: carrierId, companyName: carrierId, email: '', equipmentTypes: [] });
  }

  const panelOpen = selectedCarrier !== null;

  const pageContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <a
            data-testid="breadcrumb-dashboard-link"
            href="/dashboard/shipper"
            onClick={(e) => { e.preventDefault(); navigate('/dashboard/shipper'); }}
            style={{ color: '#B08D57', fontWeight: 600, textDecoration: 'none' }}
          >
            Dashboard
          </a>
          <span style={{ color: '#D0D0D0' }}>›</span>
          <span style={{ color: '#1A1A1A', fontWeight: 600 }}>Carrier Network</span>
        </nav>
        <button
          data-testid="back-to-dashboard-btn"
          onClick={() => navigate('/dashboard/shipper')}
          style={{ ...bronzeSecondaryStyle, padding: '7px 16px', fontSize: 13 }}
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Two-column layout */}
      <div
        style={{
          display: 'flex', gap: 24, alignItems: 'flex-start',
          paddingRight: panelOpen ? 424 : 0,
          transition: 'padding-right 300ms ease',
        }}
      >
        <FilterSidebar
          filters={filters}
          onChange={handleFilterChange}
          onSearch={handleSearch}
          onClear={handleClear}
        />

        <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Preferred strip */}
          <PreferredCarriersStrip
            preferredIds={Array.from(preferredIds)}
            carriers={carriers}
            selectedId={selectedCarrier?.id}
            onSelect={handleSelectFromStrip}
          />

          {/* Results header */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 20, fontWeight: 700, margin: 0 }}>
                  Available Carriers
                </h2>
                {hasSearched && (
                  <span style={{ fontSize: 13, color: '#9CA3AF' }}>{carriers.length} results</span>
                )}
              </div>
              <select
                data-testid="sort-carriers-select"
                aria-label="Sort carriers"
                style={{ height: 32, fontSize: 12, paddingLeft: 8, paddingRight: 8, border: '1px solid #D0D0D0', borderRadius: 4, background: '#fff' }}
              >
                <option>Sort: Highest rated</option>
                <option>Sort: Most loads</option>
                <option>Sort: On-time rate</option>
                <option>Sort: Newest</option>
              </select>
            </div>

            {isSearching && (
              <div style={{ textAlign: 'center', padding: 48, color: '#9CA3AF', fontSize: 14 }}>
                Searching carriers…
              </div>
            )}

            {!isSearching && hasSearched && carriers.length === 0 && (
              <div data-testid="carriers-empty-state" style={{ textAlign: 'center', padding: 48, color: '#9CA3AF', fontSize: 14 }}>
                No carriers match your filters. Try widening your search.
              </div>
            )}

            {!isSearching && carriers.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {carriers.map((c) => (
                  <CarrierCard
                    key={c.id}
                    carrier={c}
                    isSelected={selectedCarrier?.id === c.id}
                    isPreferred={preferredIds.has(c.id)}
                    onSelect={handleSelectCarrier}
                    onTogglePreferred={handleTogglePreferred}
                    onGetQuote={(id) => navigate(`/shipper/quote?carrierId=${id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Slide-in detail panel */}
      <DetailPanel
        carrier={selectedCarrier}
        isPreferred={selectedCarrier ? preferredIds.has(selectedCarrier.id) : false}
        onClose={() => setSelectedCarrier(null)}
        onTogglePreferred={handleTogglePreferred}
        onAssign={(id) => navigate(`/carriers/${id}`)}
        onQuote={(id) => navigate(`/shipper/quote?carrierId=${id}`)}
      />
    </div>
  );

  return (
    <ShipperPageLayout
      data-testid="carrier-network-page"
      slotB={pageContent}
    />
  );
}
