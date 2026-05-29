package com.freightclub.modules.analytics.presentation;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.freightclub.modules.analytics.application.CarrierPerformanceService;
import com.freightclub.modules.analytics.application.CarrierPerformanceService.CarrierBenchmarksResponse;
import com.freightclub.modules.analytics.domain.CarrierPerformance;
import com.freightclub.security.TenantContextHolder;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CarrierPerformanceControllerIntegrationTest {

  @Autowired private MockMvc mvc;

  @MockBean private CarrierPerformanceService performanceService;

  private static final String TEST_TENANT_ID = "tenant-performance";
  private static final String TEST_CARRIER_ID = "carrier-123";

  @BeforeEach
  void setUp() {
    TenantContextHolder.setTenantId(TEST_TENANT_ID);
  }

  @AfterEach
  void tearDown() {
    TenantContextHolder.clear();
  }

  @Test
  @WithMockUser(roles = "SHIPPER")
  void testGetCarrierPerformance_Found() throws Exception {
    CarrierPerformance performance =
        createMockCarrierPerformance(
            TEST_CARRIER_ID,
            BigDecimal.valueOf(95.5),
            BigDecimal.valueOf(98.2),
            BigDecimal.valueOf(2.5),
            100,
            BigDecimal.valueOf(4.8),
            50,
            25);
    when(performanceService.getCarrierPerformance(TEST_CARRIER_ID, TEST_TENANT_ID))
        .thenReturn(Optional.of(performance));

    mvc.perform(get("/api/v1/carriers/{carrierId}/performance", TEST_CARRIER_ID))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.carrierId").value(TEST_CARRIER_ID))
        .andExpect(jsonPath("$.acceptanceRate").value(95.5))
        .andExpect(jsonPath("$.onTimeRate").value(98.2))
        .andExpect(jsonPath("$.loadsCompleted").value(100))
        .andExpect(jsonPath("$.qualityScore").value(4.8))
        .andExpect(jsonPath("$.ratingCount").value(50));

    verify(performanceService).getCarrierPerformance(TEST_CARRIER_ID, TEST_TENANT_ID);
  }

  @Test
  @WithMockUser(roles = "SHIPPER")
  void testGetCarrierPerformance_NotFound() throws Exception {
    when(performanceService.getCarrierPerformance(TEST_CARRIER_ID, TEST_TENANT_ID))
        .thenReturn(Optional.empty());

    mvc.perform(get("/api/v1/carriers/{carrierId}/performance", TEST_CARRIER_ID))
        .andExpect(status().isNotFound());

    verify(performanceService).getCarrierPerformance(TEST_CARRIER_ID, TEST_TENANT_ID);
  }

  @Test
  @WithMockUser(roles = "SHIPPER")
  void testGetCarrierPerformance_HighPerformer() throws Exception {
    CarrierPerformance performance =
        createMockCarrierPerformance(
            TEST_CARRIER_ID,
            BigDecimal.valueOf(99.0),
            BigDecimal.valueOf(99.5),
            BigDecimal.valueOf(1.5),
            500,
            BigDecimal.valueOf(4.9),
            200,
            150);
    when(performanceService.getCarrierPerformance(TEST_CARRIER_ID, TEST_TENANT_ID))
        .thenReturn(Optional.of(performance));

    mvc.perform(get("/api/v1/carriers/{carrierId}/performance", TEST_CARRIER_ID))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.acceptanceRate").value(99.0))
        .andExpect(jsonPath("$.onTimeRate").value(99.5))
        .andExpect(jsonPath("$.qualityScore").value(4.9));
  }

  @Test
  @WithMockUser(roles = "SHIPPER")
  void testGetCarrierPerformance_LowPerformer() throws Exception {
    CarrierPerformance performance =
        createMockCarrierPerformance(
            TEST_CARRIER_ID,
            BigDecimal.valueOf(65.0),
            BigDecimal.valueOf(70.0),
            BigDecimal.valueOf(8.0),
            20,
            BigDecimal.valueOf(2.5),
            5,
            0);
    when(performanceService.getCarrierPerformance(TEST_CARRIER_ID, TEST_TENANT_ID))
        .thenReturn(Optional.of(performance));

    mvc.perform(get("/api/v1/carriers/{carrierId}/performance", TEST_CARRIER_ID))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.acceptanceRate").value(65.0))
        .andExpect(jsonPath("$.onTimeRate").value(70.0))
        .andExpect(jsonPath("$.qualityScore").value(2.5));
  }

  @Test
  @WithMockUser(roles = "SHIPPER")
  void testGetTopCarriers_ReturnsEmpty() throws Exception {
    when(performanceService.getTopPerformers()).thenReturn(List.of());

    mvc.perform(get("/api/v1/analytics/top-carriers"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(0));

    verify(performanceService).getTopPerformers();
  }

  @Test
  @WithMockUser(roles = "SHIPPER")
  void testGetTopCarriers_ReturnsList() throws Exception {
    CarrierPerformance carrier1 =
        createMockCarrierPerformance(
            "carrier-1",
            BigDecimal.valueOf(97.0),
            BigDecimal.valueOf(99.0),
            BigDecimal.valueOf(2.0),
            1000,
            BigDecimal.valueOf(4.8),
            500,
            200);
    CarrierPerformance carrier2 =
        createMockCarrierPerformance(
            "carrier-2",
            BigDecimal.valueOf(96.0),
            BigDecimal.valueOf(98.0),
            BigDecimal.valueOf(2.5),
            900,
            BigDecimal.valueOf(4.7),
            400,
            180);
    when(performanceService.getTopPerformers()).thenReturn(List.of(carrier1, carrier2));

    mvc.perform(get("/api/v1/analytics/top-carriers"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(2))
        .andExpect(jsonPath("$[0].carrierId").value("carrier-1"))
        .andExpect(jsonPath("$[1].carrierId").value("carrier-2"))
        .andExpect(jsonPath("$[0].qualityScore").value(4.8))
        .andExpect(jsonPath("$[1].qualityScore").value(4.7));

    verify(performanceService).getTopPerformers();
  }

  @Test
  @WithMockUser(roles = "SHIPPER")
  void testGetTopCarriers_ReturnsSingleCarrier() throws Exception {
    CarrierPerformance carrier =
        createMockCarrierPerformance(
            "carrier-elite",
            BigDecimal.valueOf(98.5),
            BigDecimal.valueOf(99.0),
            BigDecimal.valueOf(1.8),
            2000,
            BigDecimal.valueOf(4.9),
            1000,
            500);
    when(performanceService.getTopPerformers()).thenReturn(List.of(carrier));

    mvc.perform(get("/api/v1/analytics/top-carriers"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(1))
        .andExpect(jsonPath("$[0].carrierId").value("carrier-elite"));
  }

  @Test
  @WithMockUser(roles = "SHIPPER")
  void testGetBenchmarks_ReturnsData() throws Exception {
    CarrierBenchmarksResponse benchmarks =
        new CarrierBenchmarksResponse(
            BigDecimal.valueOf(95.5),
            BigDecimal.valueOf(98.2),
            BigDecimal.valueOf(4.7));
    when(performanceService.getBenchmarks()).thenReturn(benchmarks);

    mvc.perform(get("/api/v1/analytics/carrier-benchmarks"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.avgAcceptanceRate").value(95.5))
        .andExpect(jsonPath("$.avgOnTimeRate").value(98.2))
        .andExpect(jsonPath("$.avgQualityScore").value(4.7));

    verify(performanceService).getBenchmarks();
  }

  @Test
  @WithMockUser(roles = "SHIPPER")
  void testGetBenchmarks_ContentType() throws Exception {
    CarrierBenchmarksResponse benchmarks =
        new CarrierBenchmarksResponse(
            BigDecimal.valueOf(95.5),
            BigDecimal.valueOf(98.2),
            BigDecimal.valueOf(4.7));
    when(performanceService.getBenchmarks()).thenReturn(benchmarks);

    mvc.perform(get("/api/v1/analytics/carrier-benchmarks"))
        .andExpect(status().isOk())
        .andExpect(content().contentTypeCompatibleWith("application/json"));
  }

  @Test
  void testGetCarrierPerformance_RequiresAuthentication() throws Exception {
    mvc.perform(get("/api/v1/carriers/{carrierId}/performance", TEST_CARRIER_ID))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void testGetTopCarriers_RequiresAuthentication() throws Exception {
    mvc.perform(get("/api/v1/analytics/top-carriers"))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void testGetBenchmarks_RequiresAuthentication() throws Exception {
    mvc.perform(get("/api/v1/analytics/carrier-benchmarks"))
        .andExpect(status().isUnauthorized());
  }

  @Test
  @WithMockUser(roles = "SHIPPER")
  void testGetCarrierPerformance_ZeroLoads() throws Exception {
    CarrierPerformance performance =
        createMockCarrierPerformance(
            TEST_CARRIER_ID,
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            0,
            BigDecimal.ZERO,
            0,
            0);
    when(performanceService.getCarrierPerformance(TEST_CARRIER_ID, TEST_TENANT_ID))
        .thenReturn(Optional.of(performance));

    mvc.perform(get("/api/v1/carriers/{carrierId}/performance", TEST_CARRIER_ID))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.loadsCompleted").value(0))
        .andExpect(jsonPath("$.ratingCount").value(0));
  }

  @Test
  @WithMockUser(roles = "SHIPPER")
  void testGetCarrierPerformance_LargeNumbers() throws Exception {
    CarrierPerformance performance =
        createMockCarrierPerformance(
            TEST_CARRIER_ID,
            BigDecimal.valueOf(99.99),
            BigDecimal.valueOf(99.99),
            BigDecimal.valueOf(0.1),
            10000,
            BigDecimal.valueOf(4.99),
            5000,
            3000);
    when(performanceService.getCarrierPerformance(TEST_CARRIER_ID, TEST_TENANT_ID))
        .thenReturn(Optional.of(performance));

    mvc.perform(get("/api/v1/carriers/{carrierId}/performance", TEST_CARRIER_ID))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.loadsCompleted").value(10000))
        .andExpect(jsonPath("$.ratingCount").value(5000))
        .andExpect(jsonPath("$.preferredByCount").value(3000));
  }

  private CarrierPerformance createMockCarrierPerformance(
      String carrierId,
      BigDecimal acceptanceRate,
      BigDecimal onTimeRate,
      BigDecimal avgDeliveryTimeHours,
      long loadAssigned,
      BigDecimal qualityScore,
      long ratingCount,
      long preferredByCount) {
    CarrierPerformance cp = new CarrierPerformance();
    cp.setCarrierId(carrierId);
    cp.setTenantId(TEST_TENANT_ID);
    cp.setAcceptanceRate(acceptanceRate);
    cp.setOnTimeRate(onTimeRate);
    cp.setAvgDeliveryTimeHours(avgDeliveryTimeHours);
    cp.setLoadAssigned(loadAssigned);
    cp.setQualityScore(qualityScore);
    cp.setRatingCount(ratingCount);
    cp.setPreferredByCount(preferredByCount);
    return cp;
  }
}
