package com.freightclub.modules.analytics.application;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.freightclub.modules.analytics.domain.LoadAnalytics;
import com.freightclub.modules.analytics.infrastructure.LoadAnalyticsRepository;
import com.freightclub.security.TenantContextHolder;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
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
class LoadAnalyticsServiceTest {

  @Mock private LoadAnalyticsRepository repository;

  private LoadAnalyticsService service;

  private static final String TEST_TENANT_ID = "tenant-123";
  private static final String TEST_LOAD_ID = "load-456";
  private static final String TEST_SHIPPER_ID = "shipper-789";

  @BeforeEach
  void setup() {
    TenantContextHolder.setTenantId(TEST_TENANT_ID);
    TenantContextHolder.setUserId("test-user-123");
    service = new LoadAnalyticsService(repository);
  }

  @AfterEach
  void teardown() {
    TenantContextHolder.clear();
  }

  @Test
  void testRecordLoadAnalytics_CreatesAnalyticsRecord() {
    OffsetDateTime postedAt = OffsetDateTime.now(ZoneOffset.UTC);

    service.recordLoadAnalytics(
        TEST_LOAD_ID, TEST_SHIPPER_ID, postedAt, 10, 150);

    verify(repository, times(1)).save(any(LoadAnalytics.class));
  }

  @Test
  void testRecordLoadClaim_UpdatesClaimTime() {
    String truckerId = "trucker-111";
    OffsetDateTime postedAt = OffsetDateTime.now(ZoneOffset.UTC).minusHours(2);
    OffsetDateTime claimedAt = OffsetDateTime.now(ZoneOffset.UTC);

    LoadAnalytics analytics = LoadAnalytics.recordPosted(
        TEST_TENANT_ID, TEST_LOAD_ID, postedAt, 10, 150);

    when(repository.findById(TEST_LOAD_ID)).thenReturn(Optional.of(analytics));

    service.recordLoadClaim(TEST_LOAD_ID, truckerId, claimedAt);

    verify(repository, times(1)).findById(TEST_LOAD_ID);
    verify(repository, times(1)).save(any(LoadAnalytics.class));
  }

  @Test
  void testGetAdminAnalytics_ReturnsMetrics() {
    when(repository.countPostedSince(eq(TEST_TENANT_ID), any(OffsetDateTime.class))).thenReturn(100L);
    when(repository.countClaimedSince(eq(TEST_TENANT_ID), any(OffsetDateTime.class))).thenReturn(50L);
    when(repository.avgClaimTimeSecondsSince(eq(TEST_TENANT_ID), any(OffsetDateTime.class)))
        .thenReturn(7200.0); // 2 hours

    LoadAnalyticsService.AdminAnalyticsResponse response =
        service.getAdminAnalytics(TEST_TENANT_ID, 7);

    assertNotNull(response);
    assertEquals(100, response.totalPosted());
    assertEquals(50, response.totalClaimed());
    assertEquals(50, response.claimPercentage());
    assertEquals(2.0, response.avgClaimTimeHours());
  }

  @Test
  void testGetAdminAnalytics_HandlesZeroLoads() {
    when(repository.countPostedSince(eq(TEST_TENANT_ID), any(OffsetDateTime.class))).thenReturn(0L);
    when(repository.countClaimedSince(eq(TEST_TENANT_ID), any(OffsetDateTime.class))).thenReturn(0L);
    when(repository.avgClaimTimeSecondsSince(eq(TEST_TENANT_ID), any(OffsetDateTime.class)))
        .thenReturn(0.0);

    LoadAnalyticsService.AdminAnalyticsResponse response =
        service.getAdminAnalytics(TEST_TENANT_ID, 7);

    assertNotNull(response);
    assertEquals(0, response.totalPosted());
    assertEquals(0, response.claimPercentage());
  }

  @Test
  void testGetShipperAnalytics_ComputesMetrics() {
    when(repository.findByShipperInDateRange(
            eq(TEST_TENANT_ID), eq(TEST_SHIPPER_ID), any()))
        .thenReturn(createMockShipperPage());

    LoadAnalyticsService.ShipperAnalyticsResponse response =
        service.getShipperAnalytics(TEST_SHIPPER_ID, TEST_TENANT_ID, 30);

    assertNotNull(response);
    assertTrue(response.postedCount() > 0);
  }

  @Test
  void testMultiTenantIsolation_FiltersCorrectly() {
    String tenantA = "tenant-a";
    String tenantB = "tenant-b";

    when(repository.countPostedSince(eq(tenantA), any(OffsetDateTime.class))).thenReturn(100L);
    when(repository.countClaimedSince(eq(tenantA), any(OffsetDateTime.class))).thenReturn(50L);
    when(repository.avgClaimTimeSecondsSince(eq(tenantA), any(OffsetDateTime.class))).thenReturn(7200.0);

    when(repository.countPostedSince(eq(tenantB), any(OffsetDateTime.class))).thenReturn(50L);
    when(repository.countClaimedSince(eq(tenantB), any(OffsetDateTime.class))).thenReturn(25L);
    when(repository.avgClaimTimeSecondsSince(eq(tenantB), any(OffsetDateTime.class))).thenReturn(3600.0);

    LoadAnalyticsService.AdminAnalyticsResponse responseA =
        service.getAdminAnalytics(tenantA, 7);
    LoadAnalyticsService.AdminAnalyticsResponse responseB =
        service.getAdminAnalytics(tenantB, 7);

    assertEquals(100, responseA.totalPosted());
    assertEquals(50, responseB.totalPosted());
  }

  private Page<LoadAnalytics> createMockShipperPage() {
    return new PageImpl<>(java.util.List.of(createMockLoadAnalytics()));
  }

  private LoadAnalytics createMockLoadAnalytics() {
    OffsetDateTime postedAt = OffsetDateTime.now(ZoneOffset.UTC);
    return LoadAnalytics.recordPosted(
        TEST_TENANT_ID, TEST_LOAD_ID, postedAt, 10, 150);
  }
}
