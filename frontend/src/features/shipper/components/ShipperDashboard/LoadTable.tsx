import React, { useState } from 'react';
import { STATUS_BADGE_MAP } from './statusBadge'

interface LoadTableProps {
  loads: Array<{
    id: string
    originCity: string
    originState: string
    destinationCity: string
    destinationState: string
    pickupEarliest: string
    pickupLatest: string
    status: string
    payAmount: number
    payUnit: string
    claimedByTruckerName: string | null
  }>
  onViewDetails: (id: string) => void
  onEdit: (id: string) => void
  onCancel: (id: string) => void
}

const TH_STYLE: React.CSSProperties = {
  textAlign: 'left',
  padding: '8px 12px',
  fontSize: '12px',
  fontWeight: 600,
  textTransform: 'uppercase',
  color: '#636E72',
  background: '#F5F0E8',
  whiteSpace: 'nowrap',
};

const TD_STYLE: React.CSSProperties = {
  padding: '0 12px',
  fontSize: '14px',
  height: '48px',
  verticalAlign: 'middle',
};

export function LoadTable({ loads, onViewDetails, onEdit, onCancel }: LoadTableProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const statusColorMap = STATUS_BADGE_MAP;

  const isEditEnabled = (status: string) => ['DRAFT', 'OPEN', 'CLAIMED'].includes(status);
  const isCancelEnabled = (status: string) => !['DELIVERED', 'CANCELLED', 'DRAFT'].includes(status);

  return (
    <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
        <thead>
          <tr>
            <th style={TH_STYLE} data-testid="table-header-origin">Load</th>
            <th style={TH_STYLE} data-testid="table-header-destination">Route</th>
            <th style={TH_STYLE}>Pickup Window</th>
            <th style={TH_STYLE} data-testid="table-header-status">Status</th>
            <th style={TH_STYLE}>Pay Rate</th>
            <th style={{ ...TH_STYLE, textAlign: 'center' }}>Actions</th>
            <th style={{ ...TH_STYLE, width: '20px' }} aria-label="row-select" />
          </tr>
        </thead>
        <tbody>
          {loads.map((load) => {
            const isSelected = selectedRow === load.id;
            const isHovered = hoveredRow === load.id;
            const rowStyle: React.CSSProperties = {
              borderBottom: '1px solid #E8E3D8',
              background: isSelected ? '#FBF5E8' : isHovered ? '#F5F0E8' : '#FFFFFF',
              borderLeft: isSelected ? '3px solid #B08D57' : '3px solid transparent',
              cursor: 'pointer',
            };

            return (
              <tr
                key={load.id}
                style={rowStyle}
                onMouseEnter={() => setHoveredRow(load.id)}
                onMouseLeave={() => setHoveredRow(null)}
                onClick={() => setSelectedRow(isSelected ? null : load.id)}
              >
                <td style={TD_STYLE}>{load.originCity}, {load.originState}</td>
                <td style={TD_STYLE}>{load.destinationCity}, {load.destinationState}</td>
                <td style={{ ...TD_STYLE, fontSize: '12px' }}>
                  {new Date(load.pickupEarliest).toLocaleDateString()}{' '}
                  {new Date(load.pickupEarliest).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}–
                  {new Date(load.pickupLatest).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td style={TD_STYLE}>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${statusColorMap[load.status] || 'bg-gray-100'}`}>
                    {load.status}
                  </span>
                </td>
                <td style={TD_STYLE}>
                  {load.payUnit === 'flat'
                    ? `$${(load.payAmount / 1000).toFixed(1)}k`
                    : `$${load.payAmount.toFixed(2)}/${load.payUnit}`}
                </td>
                <td style={{ ...TD_STYLE, textAlign: 'center' }}>
                  <span style={{ display: 'inline-flex', gap: '4px' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); onEdit(load.id); }}
                      disabled={!isEditEnabled(load.status)}
                      style={{
                        width: '24px', height: '24px', cursor: isEditEnabled(load.status) ? 'pointer' : 'not-allowed',
                        color: isEditEnabled(load.status) ? '#3498DB' : '#D0D0D0',
                        background: 'none', border: 'none', fontSize: '14px',
                      }}
                      title="Edit"
                    >
                      ✎
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onCancel(load.id); }}
                      disabled={!isCancelEnabled(load.status)}
                      style={{
                        width: '24px', height: '24px', cursor: isCancelEnabled(load.status) ? 'pointer' : 'not-allowed',
                        color: isCancelEnabled(load.status) ? '#E74C3C' : '#D0D0D0',
                        background: 'none', border: 'none', fontSize: '14px',
                      }}
                      title="Cancel"
                    >
                      ✕
                    </button>
                  </span>
                </td>
                {/* Chevron affordance */}
                <td style={{ ...TD_STYLE, textAlign: 'center', width: '20px' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); onViewDetails(load.id); }}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: isHovered || isSelected ? '#B08D57' : '#D0D0D0',
                      fontSize: '18px', lineHeight: 1,
                      transform: isHovered || isSelected ? 'translateX(2px)' : 'none',
                      transition: 'color 0.15s, transform 0.15s',
                    }}
                    title="View Details"
                    data-testid={`load-row-chevron-${load.id}`}
                  >
                    ›
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
