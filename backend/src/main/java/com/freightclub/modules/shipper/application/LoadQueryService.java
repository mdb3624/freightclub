package com.freightclub.modules.shipper.application;

import com.freightclub.domain.Load;
import com.freightclub.domain.LoadStatus;
import com.freightclub.modules.shipper.infrastructure.rest.dto.LoadListResponse;
import com.freightclub.modules.shipper.infrastructure.rest.dto.LoadStatsResponse;
import com.freightclub.repository.LoadRepository;
import com.freightclub.security.TenantContextHolder;
import jakarta.persistence.EntityManager;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Application service for querying shipper load data with RLS and soft-delete filtering.
 * Ensures tenant isolation via TenantContextHolder and respects soft-delete semantics.
 * AC-US-715: Load statistics (Endpoint 1) and pagination (Endpoint 2).
 */
@Service
@Transactional(readOnly = true)
public class LoadQueryService {

    private final LoadRepository loadRepository;
    private final EntityManager em;

    public LoadQueryService(LoadRepository loadRepository, EntityManager em) {
        this.loadRepository = loadRepository;
        this.em = em;
    }

    private void setTenantForRls(String tenantId) {
        em.createNativeQuery("SELECT set_config('app.current_tenant', :tid, true)")
                .setParameter("tid", tenantId)
                .getSingleResult();
    }

    // Shared query: single source of truth for "which loads are relevant to the shipper
    // dashboard" (excludes DRAFT/CANCELLED/SETTLED/DISPUTED per LoadStatus.excludedFromDashboard()).
    // Both KPISummaryService (KPI tile) and ShipmentStatusService (Shipment Status panel) call
    // this instead of writing their own independent status filters, so the two can't drift on
    // what counts as "active" again — see US-820 fix, 2026-07-20.
    public List<Load> findDashboardLoads(String tenantId) {
        setTenantForRls(tenantId);
        return loadRepository.findByTenantIdAndStatusNotInAndDeletedAtIsNull(tenantId, LoadStatus.excludedFromDashboard());
    }

    /**
     * Gets load status counts for the shipper dashboard.
     * AC-1: Active view excludes DRAFT and soft-deleted loads.
     * AC-2: All view includes DRAFT and counts soft-deleted loads as CANCELLED.
     *
     * @param view "active" or "all" to control which statuses are counted
     * @return LoadStatsResponse with status counts and optional all-view stats
     */
    public LoadStatsResponse getLoadStats(String view) {
        String tenantId = TenantContextHolder.getTenantId();
        setTenantForRls(tenantId);

        // Always compute active counts (non-deleted, published statuses)
        int openCount = countByTenantAndStatus(tenantId, LoadStatus.OPEN, false);
        int claimedCount = countByTenantAndStatus(tenantId, LoadStatus.CLAIMED, false);
        int inTransitCount = countByTenantAndStatus(tenantId, LoadStatus.IN_TRANSIT, false);
        int deliveredCount = countByTenantAndStatus(tenantId, LoadStatus.DELIVERED, false);

        var activeStats = LoadStatsResponse.StatusCounts.of(
            openCount, claimedCount, inTransitCount, deliveredCount
        );

        if ("all".equals(view)) {
            // Compute all-view counts (includes DRAFT and soft-deleted)
            int draftCount = countByTenantAndStatus(tenantId, LoadStatus.DRAFT, false);
            int cancelledCount = countByTenantAndStatus(tenantId, LoadStatus.CANCELLED, true);

            var allStats = LoadStatsResponse.StatusCounts.of(
                openCount, claimedCount, inTransitCount, deliveredCount, draftCount, cancelledCount
            );

            return LoadStatsResponse.of(activeStats, allStats, "all");
        }

        return LoadStatsResponse.of(activeStats, null, "active");
    }

    /**
     * Gets paginated load list for shipper dashboard.
     * AC-3: Only returns non-soft-deleted loads (active view).
     * AC-4: Respects tenant isolation via TenantContextHolder.
     * AC-5: Supports sorting by any Load field (pickupFrom, createdAt, payRate, etc.).
     *
     * @param page         0-indexed page number
     * @param limit        number of results per page
     * @param view         "active" or "all" (currently only active supported for list)
     * @param sortField    field to sort by (e.g., "pickupFrom", "createdAt")
     * @param sortOrder    "asc" or "desc"
     * @return LoadListResponse with load items and pagination metadata
     */
    public LoadListResponse getShipperLoads(
        int page,
        int limit,
        String view,
        String sortField,
        String sortOrder
    ) {
        String tenantId = TenantContextHolder.getTenantId();
        setTenantForRls(tenantId);
        String shipperId = TenantContextHolder.getCurrentUserId();

        // Build sort direction
        var direction = Sort.Direction.fromString(sortOrder.toUpperCase());
        var pageable = PageRequest.of(page, limit, Sort.by(direction, sortField));

        // Query non-deleted loads for current shipper
        var pageResult = loadRepository.findByTenantIdAndShipperIdAndDeletedAtIsNull(
            tenantId, shipperId, pageable
        );

        // Map Load entities to DTOs
        var items = new ArrayList<LoadListResponse.LoadItemDto>();
        for (var load : pageResult.getContent()) {
            items.add(mapToLoadItemDto(load));
        }

        return LoadListResponse.of(
            items.toArray(new LoadListResponse.LoadItemDto[0]),
            page,
            limit,
            (int) pageResult.getTotalElements()
        );
    }

    // Private helper methods

    /**
     * Counts loads by tenant, status, and deletion state.
     * Applies soft-delete filtering: deleted_at IS NULL for active, IS NOT NULL for soft-deleted.
     *
     * @param tenantId  tenant identifier
     * @param status    load status to filter by
     * @param includeDeleted true to count soft-deleted (deleted_at IS NOT NULL), false for active
     * @return count of matching loads
     */
    private int countByTenantAndStatus(String tenantId, LoadStatus status, boolean includeDeleted) {
        long count;
        if (includeDeleted) {
            // Count soft-deleted loads (for "all" view CANCELLED count)
            count = loadRepository.countByTenantIdAndStatusAndDeletedAtIsNotNull(tenantId, status);
        } else {
            // Count active (non-deleted) loads
            count = loadRepository.countByTenantIdAndStatusAndDeletedAtIsNull(tenantId, status);
        }
        return (int) count;
    }

    /**
     * Maps Load entity to LoadItemDto for API response.
     * Extracts key fields for load card display.
     * Includes null safety guards for temporal and optional fields.
     *
     * @param load Load entity
     * @return LoadItemDto with mapped values
     */
    private LoadListResponse.LoadItemDto mapToLoadItemDto(Load load) {
        return new LoadListResponse.LoadItemDto(
            load.getId(),
            load.getOriginCity(),
            load.getOriginState(),
            load.getDestinationCity(),
            load.getDestinationState(),
            Objects.requireNonNull(load.getPickupFrom()).toString(),
            Objects.requireNonNull(load.getPickupTo()).toString(),
            load.getStatus().name(),
            load.getPayRate().doubleValue(),
            formatPayRateType(load.getPayRateType()),
            null, // claimedByTruckerName (null for shipper view)
            Objects.requireNonNull(load.getCreatedAt()).toString()
        );
    }

    private String formatPayRateType(com.freightclub.domain.PayRateType type) {
        return type.name().toLowerCase().replace("_", " ");
    }
}
