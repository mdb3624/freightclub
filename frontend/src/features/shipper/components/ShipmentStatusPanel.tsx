/**
 * US-822: Shipment Status Panel
 *
 * Displays a searchable, sortable list of active shipments for shipper operations managers.
 * Refined professional aesthetic: clean grid, strong hierarchy, intentional typography.
 * Per HFD spec: 48px rows, 12px×16px cell padding, UPPERCASE header, status-first urgency ordering.
 */

import React, { useState, useMemo } from 'react';
import { useCancelLoad } from '@/features/loads/hooks/useCancelLoad';
import styles from './ShipmentStatusPanel.module.css';

interface Shipment {
  loadId: string;
  status: string;
  progress: number;
  equipment: string;
  carrier: string | null;
  rating: number | null;
  destination: string;
}

interface ShipmentStatusPanelProps {
  shipments: Shipment[];
  isLoading?: boolean;
  onTrackShipments?: () => void;
}

const statusConfig: Record<string, { label: string; badge: string; color: string }> = {
  OPEN: { label: 'Posted', badge: 'urgent', color: '#E74C3C' },
  CLAIMED: { label: 'Claimed', badge: 'warning', color: '#F39C12' },
  IN_TRANSIT: { label: 'In Transit', badge: 'info', color: '#3498DB' },
  DELIVERED: { label: 'Delivered', badge: 'success', color: '#27AE60' },
};

const getStatusBadgeClass = (status: string): string => {
  if (status === 'OPEN') return 'badge-urgent';
  if (status === 'CLAIMED') return 'badge-warning';
  if (status === 'IN_TRANSIT') return 'badge-info';
  if (status === 'DELIVERED') return 'badge-success';
  return 'badge-info';
};

const renderStars = (rating: number): string => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  let stars = '★'.repeat(fullStars);
  if (hasHalf) stars += '½';
  stars += '☆'.repeat(5 - Math.ceil(rating));
  return stars;
};

export const ShipmentStatusPanel: React.FC<ShipmentStatusPanelProps> = ({
  shipments,
  isLoading = false,
  onTrackShipments,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const { mutate: cancelLoad } = useCancelLoad()

  const filteredShipments = useMemo(() => {
    if (!searchQuery.trim()) return shipments;

    const query = searchQuery.toLowerCase();
    return shipments.filter(
      (s) =>
        s.loadId.toLowerCase().includes(query) ||
        s.destination.toLowerCase().includes(query) ||
        (s.carrier && s.carrier.toLowerCase().includes(query))
    );
  }, [shipments, searchQuery]);

  if (isLoading) {
    return (
      <div className={styles.panel}>
        <div className={styles.header}>
          <h2 className={styles.title}>Shipment Status</h2>
          <button className={styles.actionButton} disabled>
            Track Shipments
          </button>
        </div>
        <div className={styles.skeleton}>Loading shipments...</div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h2 className={styles.title}>SHIPMENT STATUS</h2>
          <div className={styles.headerActions}>
            <a href="#" className={styles.headerLink}>Manage/Save Drafts</a>
            <a href="#" className={styles.headerLinkBronze} onClick={onTrackShipments}>Track Shipments</a>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search by Load ID, destination, or carrier..."
          className={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          data-testid="shipment-search-input"
        />
      </div>

      {/* List or Empty State */}
      {filteredShipments.length === 0 ? (
        <div className={styles.emptyState}>
          {shipments.length === 0 ? (
            <>
              <p>No active shipments</p>
              <p className={styles.emptySubtext}>Post a load to get started</p>
            </>
          ) : (
            <>
              <p>No shipments match your search</p>
              <p className={styles.emptySubtext}>Try a different Load ID, destination, or carrier name</p>
            </>
          )}
        </div>
      ) : (
        <div className={styles.listContainer} role="table" aria-label="Shipment Status List">
          {/* Column Headers */}
          <div className={styles.headerRow}>
            <div className={styles.colLoadId}>Load ID</div>
            <div className={styles.colStatus}>Status</div>
            <div className={styles.colProgress}>Progress</div>
            <div className={styles.colEquipment}>Equipment</div>
            <div className={styles.colCarrier}>Carrier</div>
            <div className={styles.colRating}>Rating</div>
            <div className={styles.colDestination}>Destination</div>
            <div className="px-3 py-2 text-right text-xs font-semibold">Action</div>
          </div>

          {/* Shipment Rows */}
          {filteredShipments.map((shipment) => (
            <div
              key={shipment.loadId}
              className={styles.row}
              data-testid={`shipment-row-${shipment.loadId}`}
            >
              <div className={styles.colLoadId}>
                <span className={styles.loadId}>{shipment.loadId}</span>
              </div>

              <div className={styles.colStatus}>
                <span className={`${styles.badge} ${styles[getStatusBadgeClass(shipment.status)]}`}>
                  {statusConfig[shipment.status]?.label || shipment.status}
                </span>
              </div>

              <div className={styles.colProgress}>
                <div className={styles.progressTrack}>
                  <div className={styles.progressFill} style={{ width: `${shipment.progress}%` }} />
                </div>
              </div>

              <div className={styles.colEquipment}>
                <span className={styles.equipment}>{shipment.equipment}</span>
              </div>

              <div className={styles.colCarrier}>
                <span className={styles.carrierName}>{shipment.carrier || 'Unassigned'}</span>
              </div>

              <div className={styles.colRating}>
                <span className={styles.rating}>
                  {shipment.rating ? renderStars(shipment.rating) : '—'}
                </span>
              </div>

              <div className={styles.colDestination}>
                <span className={styles.destination}>{shipment.destination}</span>
              </div>
              <div className="px-3 py-2 flex justify-end">
                <button
                  onClick={() => {
                    if (confirm(`Cancel load ${shipment.loadId}?`)) {
                      cancelLoad({ loadId: shipment.loadId })
                    }
                  }}
                  className="text-xs text-red-600 hover:text-red-800 font-medium hover:underline"
                  data-testid={`shipment-cancel-${shipment.loadId}`}
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Result Count */}
      {filteredShipments.length > 0 && (
        <div className={styles.footer}>
          <p className={styles.resultCount}>
            Showing {filteredShipments.length} of {shipments.length} active shipment
            {shipments.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
};

export default ShipmentStatusPanel;
