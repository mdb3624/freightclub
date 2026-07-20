package com.freightclub.modules.shipper.application;

import com.freightclub.domain.Load;
import com.freightclub.domain.LoadStatus;
import com.freightclub.modules.load.domain.CostEfficiencyCalculator;
import com.freightclub.modules.load.domain.OnTimeRateCalculator;
import com.freightclub.modules.shipper.infrastructure.rest.dto.KPISummaryResponse;
import com.freightclub.security.TenantContextHolder;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * US-820 AC-1: KPISummaryService "active loads" count.
 *
 * Root cause of the 2026-07-19/20 production bug: this service originally counted only
 * CLAIMED/IN_TRANSIT as "active", silently excluding OPEN ("Posted") loads — a freshly
 * posted, not-yet-claimed load showed in the adjacent Shipment Status panel
 * (ShipmentStatusService, which treats everything except DRAFT/CANCELLED/SETTLED/DISPUTED
 * as active) but not in this KPI tile. Aligned to the broader definition so a newly posted
 * load is immediately reflected as active — matching what a shipper actually sees below it.
 */
class KPISummaryServiceTest {

    private static final String TENANT_ID = "tenant-1";

    private LoadQueryService loadQueryService;
    private OnTimeRateCalculator onTimeRateCalculator;
    private CostEfficiencyCalculator costEfficiencyCalculator;
    private KPISummaryService service;

    @BeforeEach
    void setUp() {
        loadQueryService = mock(LoadQueryService.class);
        onTimeRateCalculator = mock(OnTimeRateCalculator.class);
        costEfficiencyCalculator = mock(CostEfficiencyCalculator.class);
        service = new KPISummaryService(loadQueryService, onTimeRateCalculator, costEfficiencyCalculator);
        TenantContextHolder.setTenantId(TENANT_ID);
    }

    @AfterEach
    void tearDown() {
        TenantContextHolder.clear();
    }

    @Test
    void getSummary_countsOpenLoadsAsActive() {
        Load openLoad = loadWithStatus(LoadStatus.OPEN);
        when(loadQueryService.findDashboardLoads(TENANT_ID)).thenReturn(List.of(openLoad));
        when(onTimeRateCalculator.calculate(any())).thenReturn(null);
        when(costEfficiencyCalculator.calculate(any())).thenReturn(null);

        KPISummaryResponse response = service.getSummary();

        assertThat(response.activeLoadCount()).isEqualTo(1);
    }

    @Test
    void getSummary_countsClaimedAndInTransitAsActive() {
        List<Load> loads = List.of(loadWithStatus(LoadStatus.CLAIMED), loadWithStatus(LoadStatus.IN_TRANSIT));
        when(loadQueryService.findDashboardLoads(TENANT_ID)).thenReturn(loads);
        when(onTimeRateCalculator.calculate(any())).thenReturn(null);
        when(costEfficiencyCalculator.calculate(any())).thenReturn(null);

        KPISummaryResponse response = service.getSummary();

        assertThat(response.activeLoadCount()).isEqualTo(2);
    }

    @Test
    void getSummary_excludesDeliveredAndDraftFromActiveCount() {
        List<Load> loads = List.of(
                loadWithStatus(LoadStatus.OPEN),
                loadWithStatus(LoadStatus.DELIVERED),
                loadWithStatus(LoadStatus.DRAFT),
                loadWithStatus(LoadStatus.CANCELLED)
        );
        when(loadQueryService.findDashboardLoads(TENANT_ID)).thenReturn(loads);
        when(onTimeRateCalculator.calculate(any())).thenReturn(null);
        when(costEfficiencyCalculator.calculate(any())).thenReturn(null);

        KPISummaryResponse response = service.getSummary();

        assertThat(response.activeLoadCount()).isEqualTo(1);
    }

    @Test
    void getSummary_returnsEmptyState_whenNoLoads() {
        when(loadQueryService.findDashboardLoads(TENANT_ID)).thenReturn(List.of());

        KPISummaryResponse response = service.getSummary();

        assertThat(response.activeLoadCount()).isEqualTo(0);
        assertThat(response.isEmpty()).isTrue();
    }

    @Test
    void getSummary_delegatesOnTimeAndCostPerMileToCalculators() {
        List<Load> loads = List.of(loadWithStatus(LoadStatus.DELIVERED));
        when(loadQueryService.findDashboardLoads(TENANT_ID)).thenReturn(loads);
        when(onTimeRateCalculator.calculate(eq(loads))).thenReturn(BigDecimal.valueOf(94.5));
        when(costEfficiencyCalculator.calculate(eq(loads))).thenReturn(BigDecimal.valueOf(2.35));

        KPISummaryResponse response = service.getSummary();

        assertThat(response.onTimePercentage()).isEqualByComparingTo("94.5");
        assertThat(response.costPerMile()).isEqualByComparingTo("2.35");
        assertThat(response.isEmpty()).isFalse();
    }

    private Load loadWithStatus(LoadStatus status) {
        Load load = new Load();
        load.setStatus(status);
        return load;
    }
}
