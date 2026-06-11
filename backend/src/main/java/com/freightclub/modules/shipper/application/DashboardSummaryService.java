package com.freightclub.modules.shipper.application;

import com.freightclub.domain.Load;
import com.freightclub.domain.LoadStatus;
import com.freightclub.domain.PayRateType;
import com.freightclub.modules.shipper.infrastructure.rest.dto.DashboardSummaryResponse;
import com.freightclub.repository.LoadRepository;
import com.freightclub.security.TenantContextHolder;
import jakarta.persistence.EntityManager;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

/**
 * Aggregates the shipper dashboard KPI strip: activeShipments, estimatedCostPerMile,
 * and onTimeCarrierPct (US-761). Reuses the RLS bootstrap and count pattern established
 * by LoadQueryService rather than inventing a new tenant-scoped aggregate path.
 */
@Service
public class DashboardSummaryService {

    private final LoadRepository loadRepository;
    private final EntityManager em;

    public DashboardSummaryService(LoadRepository loadRepository, EntityManager em) {
        this.loadRepository = loadRepository;
        this.em = em;
    }

    private void setTenantForRls(String tenantId) {
        em.createNativeQuery("SELECT set_config('app.current_tenant', :tid, true)")
                .setParameter("tid", tenantId)
                .getSingleResult();
    }

    public DashboardSummaryResponse getSummary() {
        String tenantId = TenantContextHolder.getTenantId();
        setTenantForRls(tenantId);

        long activeShipments = loadRepository.countByTenantIdAndStatusAndDeletedAtIsNull(tenantId, LoadStatus.OPEN)
                + loadRepository.countByTenantIdAndStatusAndDeletedAtIsNull(tenantId, LoadStatus.CLAIMED)
                + loadRepository.countByTenantIdAndStatusAndDeletedAtIsNull(tenantId, LoadStatus.IN_TRANSIT);

        List<Load> deliveredLoads = loadRepository
                .findByTenantIdAndStatusAndDeletedAtIsNull(tenantId, LoadStatus.DELIVERED, Pageable.unpaged())
                .getContent();

        return new DashboardSummaryResponse(
                new DashboardSummaryResponse.Metric(activeShipments, null, "Active Shipments"),
                new DashboardSummaryResponse.Metric(estimatedCostPerMile(deliveredLoads), "$", "Est. Cost/Mile"),
                new DashboardSummaryResponse.Metric(onTimeCarrierPct(deliveredLoads), "%", "On-Time Carriers")
        );
    }

    /**
     * Averages per-mile cost across delivered loads with known distance.
     * PER_MILE loads contribute their rate directly; FLAT_RATE loads are normalized
     * by dividing payRate by distanceMiles. Loads missing distance/rate are excluded
     * to avoid skewing the aggregate with incomplete data.
     */
    private double estimatedCostPerMile(List<Load> loads) {
        double sum = 0.0;
        int count = 0;
        for (Load load : loads) {
            BigDecimal distance = load.getDistanceMiles();
            BigDecimal payRate = load.getPayRate();
            if (distance == null || payRate == null || distance.signum() <= 0) {
                continue;
            }
            double perMile = load.getPayRateType() == PayRateType.PER_MILE
                    ? payRate.doubleValue()
                    : payRate.doubleValue() / distance.doubleValue();
            sum += perMile;
            count++;
        }
        return count == 0 ? 0.0 : sum / count;
    }

    /**
     * Percentage of delivered loads where deliveredAt fell within the delivery window
     * (deliveredAt <= deliveryTo). Loads missing either timestamp are excluded.
     */
    private double onTimeCarrierPct(List<Load> loads) {
        long total = 0;
        long onTime = 0;
        for (Load load : loads) {
            if (load.getDeliveredAt() == null || load.getDeliveryTo() == null) {
                continue;
            }
            total++;
            if (!load.getDeliveredAt().isAfter(load.getDeliveryTo())) {
                onTime++;
            }
        }
        return total == 0 ? 0.0 : (onTime * 100.0) / total;
    }
}
