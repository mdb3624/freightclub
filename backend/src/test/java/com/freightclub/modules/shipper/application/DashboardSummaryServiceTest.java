package com.freightclub.modules.shipper.application;

import com.freightclub.domain.Load;
import com.freightclub.domain.LoadStatus;
import com.freightclub.domain.PayRateType;
import com.freightclub.repository.LoadRepository;
import com.freightclub.security.TenantContextHolder;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

// US-761 AC-1/AC-2/AC-3: DashboardSummaryService aggregates activeShipments,
// estimatedCostPerMile, and onTimeCarrierPct for the shipper dashboard KPI strip.
class DashboardSummaryServiceTest {

    private static final String TENANT_ID = "tenant-1";

    private LoadRepository loadRepository;
    private EntityManager entityManager;
    private DashboardSummaryService service;

    @BeforeEach
    void setUp() {
        loadRepository = mock(LoadRepository.class);
        entityManager = mock(EntityManager.class);
        Query query = mock(Query.class);
        when(entityManager.createNativeQuery(anyString())).thenReturn(query);
        when(query.setParameter(anyString(), any())).thenReturn(query);
        when(query.getSingleResult()).thenReturn(null);

        service = new DashboardSummaryService(loadRepository, entityManager);

        TenantContextHolder.setTenantId(TENANT_ID);
        TenantContextHolder.setUserId("shipper-1");
    }

    @AfterEach
    void tearDown() {
        TenantContextHolder.clear();
    }

    // AC-1: activeShipments = OPEN + CLAIMED + IN_TRANSIT counts
    @Test
    void getSummary_computesActiveShipmentsFromStatusCounts() {
        when(loadRepository.countByTenantIdAndStatusAndDeletedAtIsNull(TENANT_ID, LoadStatus.OPEN)).thenReturn(3L);
        when(loadRepository.countByTenantIdAndStatusAndDeletedAtIsNull(TENANT_ID, LoadStatus.CLAIMED)).thenReturn(2L);
        when(loadRepository.countByTenantIdAndStatusAndDeletedAtIsNull(TENANT_ID, LoadStatus.IN_TRANSIT)).thenReturn(1L);
        when(loadRepository.findByTenantIdAndStatusAndDeletedAtIsNull(eq(TENANT_ID), eq(LoadStatus.DELIVERED), any()))
                .thenReturn(emptyPage());

        var summary = service.getSummary();

        assertThat(summary.activeShipments().value()).isEqualTo(6.0);
        assertThat(summary.activeShipments().label()).isEqualTo("Active Shipments");
    }

    // AC-2: estimatedCostPerMile averages payRate/mile across delivered loads,
    // normalizing FLAT_RATE loads by distanceMiles and using PER_MILE rate as-is
    @Test
    void getSummary_computesEstimatedCostPerMileFromDeliveredLoads() {
        stubActiveCounts(0L, 0L, 0L);

        Load perMileLoad = deliveredLoad(BigDecimal.valueOf(500), PayRateType.PER_MILE, BigDecimal.valueOf(2.00));
        Load flatRateLoad = deliveredLoad(BigDecimal.valueOf(200), PayRateType.FLAT_RATE, BigDecimal.valueOf(400));

        when(loadRepository.findByTenantIdAndStatusAndDeletedAtIsNull(eq(TENANT_ID), eq(LoadStatus.DELIVERED), any()))
                .thenReturn(new PageImpl<>(List.of(perMileLoad, flatRateLoad)));

        var summary = service.getSummary();

        // perMileLoad contributes 2.00 directly; flatRateLoad contributes 400/200 = 2.00
        assertThat(summary.estimatedCostPerMile().value()).isEqualTo(2.0);
        assertThat(summary.estimatedCostPerMile().unit()).isEqualTo("$");
    }

    // AC-2: loads without distance/rate data are excluded from the cost-per-mile aggregate
    @Test
    void getSummary_excludesLoadsMissingDistanceFromCostPerMile() {
        stubActiveCounts(0L, 0L, 0L);

        Load missingDistance = deliveredLoad(null, PayRateType.FLAT_RATE, BigDecimal.valueOf(400));
        Load valid = deliveredLoad(BigDecimal.valueOf(100), PayRateType.PER_MILE, BigDecimal.valueOf(3.00));

        when(loadRepository.findByTenantIdAndStatusAndDeletedAtIsNull(eq(TENANT_ID), eq(LoadStatus.DELIVERED), any()))
                .thenReturn(new PageImpl<>(List.of(missingDistance, valid)));

        var summary = service.getSummary();

        assertThat(summary.estimatedCostPerMile().value()).isEqualTo(3.0);
    }

    // AC-3: onTimeCarrierPct = % of delivered loads where deliveredAt is within the delivery window
    @Test
    void getSummary_computesOnTimeCarrierPctFromDeliveryWindow() {
        stubActiveCounts(0L, 0L, 0L);

        LocalDateTime windowEnd = LocalDateTime.of(2026, 6, 1, 17, 0);
        Load onTime = deliveredLoadWithWindow(windowEnd, windowEnd.minusHours(1));
        Load late = deliveredLoadWithWindow(windowEnd, windowEnd.plusHours(2));

        when(loadRepository.findByTenantIdAndStatusAndDeletedAtIsNull(eq(TENANT_ID), eq(LoadStatus.DELIVERED), any()))
                .thenReturn(new PageImpl<>(List.of(onTime, late)));

        var summary = service.getSummary();

        assertThat(summary.onTimeCarrierPct().value()).isEqualTo(50.0);
        assertThat(summary.onTimeCarrierPct().unit()).isEqualTo("%");
    }

    // AC-3: with no delivered loads, onTimeCarrierPct and estimatedCostPerMile default to zero (no division by zero)
    @Test
    void getSummary_returnsZeroMetrics_whenNoDeliveredLoads() {
        stubActiveCounts(1L, 0L, 0L);
        when(loadRepository.findByTenantIdAndStatusAndDeletedAtIsNull(eq(TENANT_ID), eq(LoadStatus.DELIVERED), any()))
                .thenReturn(emptyPage());

        var summary = service.getSummary();

        assertThat(summary.estimatedCostPerMile().value()).isEqualTo(0.0);
        assertThat(summary.onTimeCarrierPct().value()).isEqualTo(0.0);
    }

    private void stubActiveCounts(long open, long claimed, long inTransit) {
        when(loadRepository.countByTenantIdAndStatusAndDeletedAtIsNull(TENANT_ID, LoadStatus.OPEN)).thenReturn(open);
        when(loadRepository.countByTenantIdAndStatusAndDeletedAtIsNull(TENANT_ID, LoadStatus.CLAIMED)).thenReturn(claimed);
        when(loadRepository.countByTenantIdAndStatusAndDeletedAtIsNull(TENANT_ID, LoadStatus.IN_TRANSIT)).thenReturn(inTransit);
    }

    private Page<Load> emptyPage() {
        return new PageImpl<>(List.of());
    }

    private Load deliveredLoad(BigDecimal distanceMiles, PayRateType payRateType, BigDecimal payRate) {
        Load load = new Load();
        load.setStatus(LoadStatus.DELIVERED);
        load.setDistanceMiles(distanceMiles);
        load.setPayRateType(payRateType);
        load.setPayRate(payRate);
        load.setDeliveredAt(LocalDateTime.of(2026, 6, 1, 12, 0));
        load.setDeliveryTo(LocalDateTime.of(2026, 6, 1, 17, 0));
        return load;
    }

    private Load deliveredLoadWithWindow(LocalDateTime deliveryTo, LocalDateTime deliveredAt) {
        Load load = new Load();
        load.setStatus(LoadStatus.DELIVERED);
        load.setDistanceMiles(BigDecimal.valueOf(100));
        load.setPayRateType(PayRateType.PER_MILE);
        load.setPayRate(BigDecimal.valueOf(2.00));
        load.setDeliveredAt(deliveredAt);
        load.setDeliveryTo(deliveryTo);
        return load;
    }
}
