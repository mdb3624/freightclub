package com.freightclub.modules.analytics.application;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.freightclub.modules.analytics.domain.LoadFinancial;
import com.freightclub.modules.analytics.infrastructure.LoadFinancialRepository;
import com.freightclub.security.TenantContextHolder;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class LoadFinancialServiceTest {

  @Mock private LoadFinancialRepository repository;

  private LoadFinancialService service;

  private static final String TEST_TENANT_ID = "tenant-123";
  private static final String TEST_LOAD_ID = "load-456";
  private static final String TEST_SHIPPER_ID = "shipper-789";
  private static final String TEST_CARRIER_ID = "carrier-111";

  @BeforeEach
  void setup() {
    TenantContextHolder.setTenantId(TEST_TENANT_ID);
    TenantContextHolder.setUserId("test-user-123");
    service = new LoadFinancialService(repository);
  }

  @AfterEach
  void teardown() {
    TenantContextHolder.clear();
  }

  @Test
  void testRecordLoadSettlement_CalculatesCommission() {
    OffsetDateTime postedAt = OffsetDateTime.now(ZoneOffset.UTC);
    BigDecimal ratePerMile = BigDecimal.valueOf(1.95);
    BigDecimal totalRevenue = BigDecimal.valueOf(195.00);

    when(repository.save(any(LoadFinancial.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    LoadFinancial result = service.recordLoadSettlement(
        TEST_LOAD_ID,
        TEST_SHIPPER_ID,
        TEST_CARRIER_ID,
        postedAt,
        ratePerMile,
        totalRevenue);

    assertNotNull(result);
    assertEquals(TEST_SHIPPER_ID, result.getShipperId());
    assertEquals(TEST_CARRIER_ID, result.getCarrierId());
    // 2% commission
    assertEquals(0, BigDecimal.valueOf(3.90).compareTo(result.getCommission()));
    // Net revenue = total - commission
    assertEquals(0, BigDecimal.valueOf(191.10).compareTo(result.getNetRevenue()));
  }

  @Test
  void testGetRevenueSummary_ComputesMetrics() {
    when(repository.getTotalRevenue(eq(TEST_TENANT_ID), eq(TEST_SHIPPER_ID), any(OffsetDateTime.class)))
        .thenReturn(127450L);
    when(repository.getTotalCommission(eq(TEST_TENANT_ID), eq(TEST_SHIPPER_ID), any(OffsetDateTime.class)))
        .thenReturn(2549L);
    when(repository.getLoadCount(eq(TEST_TENANT_ID), eq(TEST_SHIPPER_ID), any(OffsetDateTime.class)))
        .thenReturn(847L);
    when(repository.getAverageRevenuePerLoad(eq(TEST_TENANT_ID), eq(TEST_SHIPPER_ID), any(OffsetDateTime.class)))
        .thenReturn(150.41);

    LoadFinancialService.RevenueSummaryResponse response =
        service.getRevenueSummary(TEST_SHIPPER_ID, 30);

    assertNotNull(response);
    assertEquals(BigDecimal.valueOf(127450), response.totalRevenue());
    assertEquals(BigDecimal.valueOf(2549), response.totalCommission());
    assertEquals(BigDecimal.valueOf(124901), response.netRevenue());
    assertEquals(847, response.loadCount());
    assertEquals(150.41, response.avgRevenuePerLoad().doubleValue(), 0.01);
  }

  @Test
  void testGetRevenueSummary_HandlesNoData() {
    when(repository.getTotalRevenue(eq(TEST_TENANT_ID), eq(TEST_SHIPPER_ID), any(OffsetDateTime.class)))
        .thenReturn(null);
    when(repository.getTotalCommission(eq(TEST_TENANT_ID), eq(TEST_SHIPPER_ID), any(OffsetDateTime.class)))
        .thenReturn(null);
    when(repository.getLoadCount(eq(TEST_TENANT_ID), eq(TEST_SHIPPER_ID), any(OffsetDateTime.class)))
        .thenReturn(null);
    when(repository.getAverageRevenuePerLoad(eq(TEST_TENANT_ID), eq(TEST_SHIPPER_ID), any(OffsetDateTime.class)))
        .thenReturn(null);

    LoadFinancialService.RevenueSummaryResponse response =
        service.getRevenueSummary(TEST_SHIPPER_ID, 30);

    assertNotNull(response);
    assertEquals(BigDecimal.ZERO, response.totalRevenue());
    assertEquals(BigDecimal.ZERO, response.totalCommission());
    assertEquals(BigDecimal.ZERO, response.netRevenue());
    assertEquals(0, response.loadCount());
  }

  @Test
  void testRecordLoadSettlement_CommissionIsAlways2Percent() {
    OffsetDateTime postedAt = OffsetDateTime.now(ZoneOffset.UTC);
    BigDecimal ratePerMile = BigDecimal.valueOf(2.00);
    BigDecimal totalRevenue = BigDecimal.valueOf(100.00);

    when(repository.save(any(LoadFinancial.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    LoadFinancial result = service.recordLoadSettlement(
        TEST_LOAD_ID,
        TEST_SHIPPER_ID,
        TEST_CARRIER_ID,
        postedAt,
        ratePerMile,
        totalRevenue);

    // 2% of $100 = $2
    assertEquals(0, BigDecimal.valueOf(2.00).compareTo(result.getCommission()));
    // Net = $100 - $2 = $98
    assertEquals(0, BigDecimal.valueOf(98.00).compareTo(result.getNetRevenue()));
  }

  @Test
  void testGetRevenueSummary_WithPartialData() {
    when(repository.getTotalRevenue(eq(TEST_TENANT_ID), eq(TEST_SHIPPER_ID), any(OffsetDateTime.class)))
        .thenReturn(50000L);
    when(repository.getTotalCommission(eq(TEST_TENANT_ID), eq(TEST_SHIPPER_ID), any(OffsetDateTime.class)))
        .thenReturn(null); // Missing commission data
    when(repository.getLoadCount(eq(TEST_TENANT_ID), eq(TEST_SHIPPER_ID), any(OffsetDateTime.class)))
        .thenReturn(100L);
    when(repository.getAverageRevenuePerLoad(eq(TEST_TENANT_ID), eq(TEST_SHIPPER_ID), any(OffsetDateTime.class)))
        .thenReturn(null); // Missing avg data

    LoadFinancialService.RevenueSummaryResponse response =
        service.getRevenueSummary(TEST_SHIPPER_ID, 30);

    assertNotNull(response);
    assertEquals(BigDecimal.valueOf(50000), response.totalRevenue());
    assertEquals(BigDecimal.ZERO, response.totalCommission());
    assertEquals(BigDecimal.valueOf(50000), response.netRevenue());
    assertEquals(100, response.loadCount());
  }

  @Test
  void testGetRevenueSummary_With90Days() {
    when(repository.getTotalRevenue(eq(TEST_TENANT_ID), eq(TEST_SHIPPER_ID), any(OffsetDateTime.class)))
        .thenReturn(100000L);
    when(repository.getTotalCommission(eq(TEST_TENANT_ID), eq(TEST_SHIPPER_ID), any(OffsetDateTime.class)))
        .thenReturn(2000L);
    when(repository.getLoadCount(eq(TEST_TENANT_ID), eq(TEST_SHIPPER_ID), any(OffsetDateTime.class)))
        .thenReturn(200L);
    when(repository.getAverageRevenuePerLoad(eq(TEST_TENANT_ID), eq(TEST_SHIPPER_ID), any(OffsetDateTime.class)))
        .thenReturn(500.0);

    LoadFinancialService.RevenueSummaryResponse response =
        service.getRevenueSummary(TEST_SHIPPER_ID, 90);

    assertNotNull(response);
    assertEquals(BigDecimal.valueOf(100000), response.totalRevenue());
    assertEquals(BigDecimal.valueOf(2000), response.totalCommission());
    assertEquals(BigDecimal.valueOf(98000), response.netRevenue());
    assertEquals(200, response.loadCount());
  }

  @Test
  void testGetRevenueSummary_With7Days() {
    when(repository.getTotalRevenue(eq(TEST_TENANT_ID), eq(TEST_SHIPPER_ID), any(OffsetDateTime.class)))
        .thenReturn(5000L);
    when(repository.getTotalCommission(eq(TEST_TENANT_ID), eq(TEST_SHIPPER_ID), any(OffsetDateTime.class)))
        .thenReturn(100L);
    when(repository.getLoadCount(eq(TEST_TENANT_ID), eq(TEST_SHIPPER_ID), any(OffsetDateTime.class)))
        .thenReturn(10L);
    when(repository.getAverageRevenuePerLoad(eq(TEST_TENANT_ID), eq(TEST_SHIPPER_ID), any(OffsetDateTime.class)))
        .thenReturn(500.0);

    LoadFinancialService.RevenueSummaryResponse response =
        service.getRevenueSummary(TEST_SHIPPER_ID, 7);

    assertNotNull(response);
    assertEquals(BigDecimal.valueOf(5000), response.totalRevenue());
    assertEquals(BigDecimal.valueOf(100), response.totalCommission());
    assertEquals(BigDecimal.valueOf(4900), response.netRevenue());
    assertEquals(10, response.loadCount());
  }

  @Test
  void testRecordLoadSettlement_LargeRevenue() {
    OffsetDateTime postedAt = OffsetDateTime.now(ZoneOffset.UTC);
    BigDecimal ratePerMile = BigDecimal.valueOf(3.50);
    BigDecimal totalRevenue = BigDecimal.valueOf(10000.00);

    when(repository.save(any(LoadFinancial.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    LoadFinancial result = service.recordLoadSettlement(
        TEST_LOAD_ID,
        TEST_SHIPPER_ID,
        TEST_CARRIER_ID,
        postedAt,
        ratePerMile,
        totalRevenue);

    // 2% of $10,000 = $200
    assertEquals(0, BigDecimal.valueOf(200.00).compareTo(result.getCommission()));
    // Net = $10,000 - $200 = $9,800
    assertEquals(0, BigDecimal.valueOf(9800.00).compareTo(result.getNetRevenue()));
  }

  @Test
  void testRecordLoadSettlement_SmallRevenue() {
    OffsetDateTime postedAt = OffsetDateTime.now(ZoneOffset.UTC);
    BigDecimal ratePerMile = BigDecimal.valueOf(1.00);
    BigDecimal totalRevenue = BigDecimal.valueOf(50.00);

    when(repository.save(any(LoadFinancial.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    LoadFinancial result = service.recordLoadSettlement(
        TEST_LOAD_ID,
        TEST_SHIPPER_ID,
        TEST_CARRIER_ID,
        postedAt,
        ratePerMile,
        totalRevenue);

    // 2% of $50 = $1
    assertEquals(0, BigDecimal.valueOf(1.00).compareTo(result.getCommission()));
    // Net = $50 - $1 = $49
    assertEquals(0, BigDecimal.valueOf(49.00).compareTo(result.getNetRevenue()));
  }

  @Test
  void testRecordLoadSettlement_StoresCorrectTenantId() {
    OffsetDateTime postedAt = OffsetDateTime.now(ZoneOffset.UTC);
    BigDecimal ratePerMile = BigDecimal.valueOf(2.00);
    BigDecimal totalRevenue = BigDecimal.valueOf(100.00);

    when(repository.save(any(LoadFinancial.class)))
        .thenAnswer(invocation -> {
          LoadFinancial arg = invocation.getArgument(0);
          assertEquals(TEST_TENANT_ID, arg.getTenantId());
          return arg;
        });

    LoadFinancial result = service.recordLoadSettlement(
        TEST_LOAD_ID,
        TEST_SHIPPER_ID,
        TEST_CARRIER_ID,
        postedAt,
        ratePerMile,
        totalRevenue);

    assertNotNull(result);
    assertEquals(TEST_TENANT_ID, result.getTenantId());
  }

  @Test
  void testGetRevenueSummary_LargeLoadCount() {
    when(repository.getTotalRevenue(eq(TEST_TENANT_ID), eq(TEST_SHIPPER_ID), any(OffsetDateTime.class)))
        .thenReturn(500000L);
    when(repository.getTotalCommission(eq(TEST_TENANT_ID), eq(TEST_SHIPPER_ID), any(OffsetDateTime.class)))
        .thenReturn(10000L);
    when(repository.getLoadCount(eq(TEST_TENANT_ID), eq(TEST_SHIPPER_ID), any(OffsetDateTime.class)))
        .thenReturn(1000L);
    when(repository.getAverageRevenuePerLoad(eq(TEST_TENANT_ID), eq(TEST_SHIPPER_ID), any(OffsetDateTime.class)))
        .thenReturn(500.0);

    LoadFinancialService.RevenueSummaryResponse response =
        service.getRevenueSummary(TEST_SHIPPER_ID, 30);

    assertNotNull(response);
    assertEquals(1000, response.loadCount());
    assertEquals(BigDecimal.valueOf(490000), response.netRevenue());
  }
}
