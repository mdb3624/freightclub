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

  @Test
  void testGetTopPerformers_ReturnsEmpty() {
    Page<CarrierPerformance> emptyPage = new PageImpl<>(java.util.List.of());
    when(repository.findTopPerformersByTenant(eq(TEST_TENANT_ID), any()))
        .thenReturn(emptyPage);

    java.util.List<CarrierPerformance> result = service.getTopPerformers();

    assertNotNull(result);
    assertEquals(0, result.size());
  }

  @Test
  void testGetTopPerformers_ReturnsMultiple() {
    CarrierPerformance perf1 = createMockCarrierPerformance();
    CarrierPerformance perf2 = createMockCarrierPerformanceWithId("carrier-789");
    Page<CarrierPerformance> page = new PageImpl<>(java.util.List.of(perf1, perf2));

    when(repository.findTopPerformersByTenant(eq(TEST_TENANT_ID), any()))
        .thenReturn(page);

    java.util.List<CarrierPerformance> result = service.getTopPerformers();

    assertNotNull(result);
    assertEquals(2, result.size());
  }

  @Test
  void testGetBenchmarks_WithHighAverages() {
    when(repository.getAverageAcceptanceRate(TEST_TENANT_ID)).thenReturn(95.5);
    when(repository.getAverageOnTimeRate(TEST_TENANT_ID)).thenReturn(92.3);
    when(repository.getAverageQualityScore(TEST_TENANT_ID)).thenReturn(4.7);

    CarrierPerformanceService.CarrierBenchmarksResponse benchmarks =
        service.getBenchmarks();

    assertNotNull(benchmarks);
    assertEquals(95.5, benchmarks.avgAcceptanceRate().doubleValue());
    assertEquals(92.3, benchmarks.avgOnTimeRate().doubleValue());
    assertEquals(4.7, benchmarks.avgQualityScore().doubleValue());
  }

  @Test
  void testGetBenchmarks_WithLowAverages() {
    when(repository.getAverageAcceptanceRate(TEST_TENANT_ID)).thenReturn(60.0);
    when(repository.getAverageOnTimeRate(TEST_TENANT_ID)).thenReturn(65.5);
    when(repository.getAverageQualityScore(TEST_TENANT_ID)).thenReturn(2.1);

    CarrierPerformanceService.CarrierBenchmarksResponse benchmarks =
        service.getBenchmarks();

    assertNotNull(benchmarks);
    assertEquals(60.0, benchmarks.avgAcceptanceRate().doubleValue());
    assertEquals(65.5, benchmarks.avgOnTimeRate().doubleValue());
    assertEquals(2.1, benchmarks.avgQualityScore().doubleValue());
  }

  @Test
  void testGetCarrierPerformance_HighPerformer() {
    CarrierPerformance highPerformer = createMockCarrierPerformanceWithScores(
        "carrier-elite",
        BigDecimal.valueOf(99.5),
        BigDecimal.valueOf(98.0),
        BigDecimal.valueOf(4.9));

    when(repository.findByCarrierAndTenant(TEST_TENANT_ID, "carrier-elite"))
        .thenReturn(Optional.of(highPerformer));

    Optional<CarrierPerformance> result =
        service.getCarrierPerformance("carrier-elite", TEST_TENANT_ID);

    assertTrue(result.isPresent());
    assertEquals(99, result.get().getAcceptanceRate().intValue());
  }

  @Test
  void testGetCarrierPerformance_LowPerformer() {
    CarrierPerformance lowPerformer = createMockCarrierPerformanceWithScores(
        "carrier-poor",
        BigDecimal.valueOf(50.0),
        BigDecimal.valueOf(55.0),
        BigDecimal.valueOf(2.0));

    when(repository.findByCarrierAndTenant(TEST_TENANT_ID, "carrier-poor"))
        .thenReturn(Optional.of(lowPerformer));

    Optional<CarrierPerformance> result =
        service.getCarrierPerformance("carrier-poor", TEST_TENANT_ID);

    assertTrue(result.isPresent());
    assertEquals(50, result.get().getAcceptanceRate().intValue());
  }

  @Test
  void testGetTopPerformers_ReturnsMaxOf10() {
    java.util.List<CarrierPerformance> carriers = new java.util.ArrayList<>();
    for (int i = 0; i < 15; i++) {
      carriers.add(createMockCarrierPerformanceWithId("carrier-" + i));
    }
    // Pageable should limit to 10
    Page<CarrierPerformance> page = new PageImpl<>(carriers.subList(0, 10));

    when(repository.findTopPerformersByTenant(eq(TEST_TENANT_ID), any()))
        .thenReturn(page);

    java.util.List<CarrierPerformance> result = service.getTopPerformers();

    assertNotNull(result);
    assertEquals(10, result.size());
  }

  @Test
  void testGetBenchmarks_PartialNullAverages() {
    when(repository.getAverageAcceptanceRate(TEST_TENANT_ID)).thenReturn(85.0);
    when(repository.getAverageOnTimeRate(TEST_TENANT_ID)).thenReturn(null);
    when(repository.getAverageQualityScore(TEST_TENANT_ID)).thenReturn(4.2);

    CarrierPerformanceService.CarrierBenchmarksResponse benchmarks =
        service.getBenchmarks();

    assertNotNull(benchmarks);
    assertEquals(85.0, benchmarks.avgAcceptanceRate().doubleValue());
    assertEquals(0.0, benchmarks.avgOnTimeRate().doubleValue());
    assertEquals(4.2, benchmarks.avgQualityScore().doubleValue());
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

  private CarrierPerformance createMockCarrierPerformanceWithId(String carrierId) {
    return new CarrierPerformance(
        "perf-" + carrierId,
        carrierId,
        TEST_TENANT_ID,
        100L,
        90L,
        5L,
        BigDecimal.valueOf(90),
        BigDecimal.valueOf(88),
        BigDecimal.valueOf(2.5),
        BigDecimal.valueOf(4.6),
        20L,
        10L
    );
  }

  private CarrierPerformance createMockCarrierPerformanceWithScores(
      String carrierId, BigDecimal acceptanceRate, BigDecimal onTimeRate, BigDecimal qualityScore) {
    return new CarrierPerformance(
        "perf-" + carrierId,
        carrierId,
        TEST_TENANT_ID,
        200L,
        180L,
        10L,
        acceptanceRate,
        onTimeRate,
        BigDecimal.valueOf(1.5),
        qualityScore,
        50L,
        30L
    );
  }
}
