package com.freightclub.modules.analytics.application;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.freightclub.modules.analytics.domain.CarrierPerformance;
import com.freightclub.modules.analytics.infrastructure.CarrierPerformanceRepository;
import com.freightclub.security.TenantContextHolder;
import java.math.BigDecimal;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Page;

@ExtendWith(MockitoExtension.class)
class CarrierPerformanceServiceTest {

  @Mock private CarrierPerformanceRepository repository;

  private CarrierPerformanceService service;

  private static final String TEST_TENANT_ID = "tenant-123";
  private static final String TEST_CARRIER_ID = "carrier-456";

  @BeforeEach
  void setup() {
    TenantContextHolder.setTenantId(TEST_TENANT_ID);
    TenantContextHolder.setUserId("test-user-123");
    service = new CarrierPerformanceService(repository);
  }

  @AfterEach
  void teardown() {
    TenantContextHolder.clear();
  }

  @Test
  void testGetCarrierPerformance_ReturnsMetrics() {
    CarrierPerformance performance = createMockCarrierPerformance();

    when(repository.findByCarrierAndTenant(TEST_TENANT_ID, TEST_CARRIER_ID))
        .thenReturn(Optional.of(performance));

    Optional<CarrierPerformance> result =
        service.getCarrierPerformance(TEST_CARRIER_ID, TEST_TENANT_ID);

    assertTrue(result.isPresent());
    assertEquals(TEST_CARRIER_ID, result.get().getCarrierId());
    assertEquals(94, result.get().getAcceptanceRate().intValue());
  }

  @Test
  void testGetCarrierPerformance_NotFound() {
    when(repository.findByCarrierAndTenant(TEST_TENANT_ID, TEST_CARRIER_ID))
        .thenReturn(Optional.empty());

    Optional<CarrierPerformance> result =
        service.getCarrierPerformance(TEST_CARRIER_ID, TEST_TENANT_ID);

    assertFalse(result.isPresent());
  }

  @Test
  void testGetTopPerformers_ReturnsList() {
    CarrierPerformance perf1 = createMockCarrierPerformance();
    Page<CarrierPerformance> page = new PageImpl<>(java.util.List.of(perf1));

    when(repository.findTopPerformersByTenant(eq(TEST_TENANT_ID), any()))
        .thenReturn(page);

    java.util.List<CarrierPerformance> result = service.getTopPerformers();

    assertNotNull(result);
    assertEquals(1, result.size());
    assertEquals(TEST_CARRIER_ID, result.get(0).getCarrierId());
  }

  @Test
  void testGetBenchmarks_CalculatesAverages() {
    when(repository.getAverageAcceptanceRate(TEST_TENANT_ID)).thenReturn(87.0);
    when(repository.getAverageOnTimeRate(TEST_TENANT_ID)).thenReturn(84.0);
    when(repository.getAverageQualityScore(TEST_TENANT_ID)).thenReturn(4.2);

    CarrierPerformanceService.CarrierBenchmarksResponse benchmarks =
        service.getBenchmarks();

    assertNotNull(benchmarks);
    assertEquals(87.0, benchmarks.avgAcceptanceRate().doubleValue());
    assertEquals(84.0, benchmarks.avgOnTimeRate().doubleValue());
    assertEquals(4.2, benchmarks.avgQualityScore().doubleValue());
  }

  @Test
  void testGetBenchmarks_HandlesNullAverages() {
    when(repository.getAverageAcceptanceRate(TEST_TENANT_ID)).thenReturn(null);
    when(repository.getAverageOnTimeRate(TEST_TENANT_ID)).thenReturn(null);
    when(repository.getAverageQualityScore(TEST_TENANT_ID)).thenReturn(null);

    CarrierPerformanceService.CarrierBenchmarksResponse benchmarks =
        service.getBenchmarks();

    assertNotNull(benchmarks);
    assertEquals(0.0, benchmarks.avgAcceptanceRate().doubleValue());
    assertEquals(0.0, benchmarks.avgOnTimeRate().doubleValue());
    assertEquals(0.0, benchmarks.avgQualityScore().doubleValue());
  }

  private CarrierPerformance createMockCarrierPerformance() {
    return new CarrierPerformance(
        "perf-1",
        TEST_CARRIER_ID,
        TEST_TENANT_ID,
        151L, // loads assigned
        142L, // loads accepted
        7L, // loads declined
        BigDecimal.valueOf(94), // acceptance rate
        BigDecimal.valueOf(89), // on-time rate
        BigDecimal.valueOf(2.1), // avg delivery time
        BigDecimal.valueOf(4.8), // quality score
        23L, // rating count
        12L // preferred by count
    );
  }
}
