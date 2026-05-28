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
    assertEquals(BigDecimal.valueOf(3.90), result.getCommission());
    // Net revenue = total - commission
    assertEquals(BigDecimal.valueOf(191.10), result.getNetRevenue());
  }

  @Test
  void testGetRevenueSummary_ComputesMetrics() {
    OffsetDateTime startDate = OffsetDateTime.now(ZoneOffset.UTC).minusDays(30);

    when(repository.getTotalRevenue(TEST_TENANT_ID, TEST_SHIPPER_ID, startDate))
        .thenReturn(127450L);
    when(repository.getTotalCommission(TEST_TENANT_ID, TEST_SHIPPER_ID, startDate))
        .thenReturn(2549L);
    when(repository.getLoadCount(TEST_TENANT_ID, TEST_SHIPPER_ID, startDate))
        .thenReturn(847L);
    when(repository.getAverageRevenuePerLoad(TEST_TENANT_ID, TEST_SHIPPER_ID, startDate))
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
    OffsetDateTime startDate = OffsetDateTime.now(ZoneOffset.UTC).minusDays(30);

    when(repository.getTotalRevenue(TEST_TENANT_ID, TEST_SHIPPER_ID, startDate))
        .thenReturn(null);
    when(repository.getTotalCommission(TEST_TENANT_ID, TEST_SHIPPER_ID, startDate))
        .thenReturn(null);
    when(repository.getLoadCount(TEST_TENANT_ID, TEST_SHIPPER_ID, startDate))
        .thenReturn(null);
    when(repository.getAverageRevenuePerLoad(TEST_TENANT_ID, TEST_SHIPPER_ID, startDate))
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
    assertEquals(BigDecimal.valueOf(2.00), result.getCommission());
    // Net = $100 - $2 = $98
    assertEquals(BigDecimal.valueOf(98.00), result.getNetRevenue());
  }
}
