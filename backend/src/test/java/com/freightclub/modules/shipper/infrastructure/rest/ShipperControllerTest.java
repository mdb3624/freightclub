package com.freightclub.modules.shipper.infrastructure.rest;

import com.freightclub.modules.shipper.application.DashboardSummaryService;
import com.freightclub.modules.shipper.application.LoadQueryService;
import com.freightclub.modules.shipper.application.ShipmentStatusDTO;
import com.freightclub.modules.shipper.application.ShipmentStatusService;
import com.freightclub.modules.shipper.infrastructure.rest.dto.DashboardSummaryResponse;
import com.freightclub.modules.shipper.infrastructure.rest.dto.LoadListResponse;
import com.freightclub.modules.shipper.infrastructure.rest.dto.LoadStatsResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ShipperControllerTest {
  @Autowired private MockMvc mvc;
  @MockBean private LoadQueryService loadQueryService;
  @MockBean private DashboardSummaryService dashboardSummaryService;
  @MockBean private ShipmentStatusService shipmentStatusService;

  @Test
  @WithMockUser(roles = "SHIPPER")
  void testGetLoadStatsActiveView() throws Exception {
    var stats = LoadStatsResponse.StatusCounts.of(5, 3, 2, 10);
    var response = LoadStatsResponse.of(stats, null, "active");
    when(loadQueryService.getLoadStats("active")).thenReturn(response);

    mvc.perform(get("/api/v1/shipper/loads/stats").param("view", "active"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.active.open").value(5))
      .andExpect(jsonPath("$.active.claimed").value(3))
      .andExpect(jsonPath("$.active.inTransit").value(2))
      .andExpect(jsonPath("$.active.delivered").value(10))
      .andExpect(jsonPath("$.all").doesNotExist());
  }

  @Test
  @WithMockUser(roles = "SHIPPER")
  void testGetLoadStatsAllView() throws Exception {
    var activeStats = LoadStatsResponse.StatusCounts.of(5, 3, 2, 10);
    var allStats = LoadStatsResponse.StatusCounts.of(5, 3, 2, 10, 1, 2);
    var response = LoadStatsResponse.of(activeStats, allStats, "all");
    when(loadQueryService.getLoadStats("all")).thenReturn(response);

    mvc.perform(get("/api/v1/shipper/loads/stats").param("view", "all"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.active.open").value(5))
      .andExpect(jsonPath("$.all.draft").value(1))
      .andExpect(jsonPath("$.all.cancelled").value(2));
  }

  @Test
  @WithMockUser(roles = "SHIPPER")
  void testGetLoadStatsDefaultsToActiveView() throws Exception {
    var stats = LoadStatsResponse.StatusCounts.of(5, 3, 2, 10);
    var response = LoadStatsResponse.of(stats, null, "active");
    when(loadQueryService.getLoadStats("active")).thenReturn(response);

    mvc.perform(get("/api/v1/shipper/loads/stats"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.active.open").value(5));
  }

  @Test
  void testGetLoadStatsRequiresAuth() throws Exception {
    mvc.perform(get("/api/v1/shipper/loads/stats"))
      .andExpect(status().isUnauthorized());
  }

  @Test
  @WithMockUser(roles = "SHIPPER")
  void testGetShipperLoads() throws Exception {
    var item = new LoadListResponse.LoadItemDto(
        "LOAD-001", "San Jose", "CA", "Phoenix", "AZ",
        "2026-05-20T08:00", "2026-05-20T17:00",
        "OPEN", 1200.0, "flat", null, "2026-05-19T10:30:00Z"
    );
    var response = LoadListResponse.of(
        new LoadListResponse.LoadItemDto[] { item },
        0, 20, 1
    );
    when(loadQueryService.getShipperLoads(0, 20, "active", "pickupFrom", "asc"))
        .thenReturn(response);

    mvc.perform(get("/api/v1/shipper/loads?page=0&limit=20&view=active&sort=pickupFrom&order=asc"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.loads[0].id").value("LOAD-001"))
        .andExpect(jsonPath("$.loads[0].originCity").value("San Jose"))
        .andExpect(jsonPath("$.pagination.page").value(0))
        .andExpect(jsonPath("$.pagination.limit").value(20))
        .andExpect(jsonPath("$.pagination.total").value(1));
  }

  @Test
  @WithMockUser(roles = "SHIPPER")
  void testGetShipperLoadsWithDefaults() throws Exception {
    var response = LoadListResponse.of(
        new LoadListResponse.LoadItemDto[] {},
        0, 20, 0
    );
    when(loadQueryService.getShipperLoads(0, 20, "active", "pickupFrom", "asc"))
        .thenReturn(response);

    mvc.perform(get("/api/v1/shipper/loads"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.loads").isArray())
        .andExpect(jsonPath("$.pagination.page").value(0));
  }

  @Test
  void testGetShipperLoadsRequiresAuth() throws Exception {
    mvc.perform(get("/api/v1/shipper/loads"))
        .andExpect(status().isUnauthorized());
  }

  // US-761 AC-1/AC-2/AC-3: dashboard-summary returns activeShipments/estimatedCostPerMile/onTimeCarrierPct KPIs
  @Test
  @WithMockUser(roles = "SHIPPER")
  void testGetDashboardSummary() throws Exception {
    var summary = new DashboardSummaryResponse(
        new DashboardSummaryResponse.Metric(6.0, null, "Active Shipments"),
        new DashboardSummaryResponse.Metric(2.35, "$", "Est. Cost/Mile"),
        new DashboardSummaryResponse.Metric(92.5, "%", "On-Time Carriers")
    );
    when(dashboardSummaryService.getSummary()).thenReturn(summary);

    mvc.perform(get("/api/v1/shipper/dashboard-summary"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.activeShipments.value").value(6.0))
        .andExpect(jsonPath("$.activeShipments.label").value("Active Shipments"))
        .andExpect(jsonPath("$.estimatedCostPerMile.value").value(2.35))
        .andExpect(jsonPath("$.estimatedCostPerMile.unit").value("$"))
        .andExpect(jsonPath("$.onTimeCarrierPct.value").value(92.5))
        .andExpect(jsonPath("$.onTimeCarrierPct.unit").value("%"));
  }

  @Test
  void testGetDashboardSummaryRequiresAuth() throws Exception {
    mvc.perform(get("/api/v1/shipper/dashboard-summary"))
        .andExpect(status().isUnauthorized());
  }

  // US-822 AC-1: Get active shipments with status, progress, carrier info
  @Test
  @WithMockUser(roles = "SHIPPER")
  void testGetActiveShipments() throws Exception {
    var shipment = new ShipmentStatusDTO(
        "load-001",
        "CLAIMED",
        java.math.BigDecimal.valueOf(15),
        "FLATBED",
        "Carrier A",
        java.math.BigDecimal.valueOf(4.5),
        "New York, NY"
    );
    when(shipmentStatusService.getActiveShipments("test-tenant")).thenReturn(java.util.List.of(shipment));

    mvc.perform(get("/api/v1/shipper/shipments/active"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].loadId").value("load-001"))
        .andExpect(jsonPath("$[0].status").value("CLAIMED"))
        .andExpect(jsonPath("$[0].progress").value(15))
        .andExpect(jsonPath("$[0].equipment").value("FLATBED"))
        .andExpect(jsonPath("$[0].carrier").value("Carrier A"))
        .andExpect(jsonPath("$[0].destination").value("New York, NY"));
  }

  @Test
  void testGetActiveShipmentsRequiresAuth() throws Exception {
    mvc.perform(get("/api/v1/shipper/shipments/active"))
        .andExpect(status().isUnauthorized());
  }
}
