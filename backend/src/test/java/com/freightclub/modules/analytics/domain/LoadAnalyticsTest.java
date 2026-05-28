package com.freightclub.modules.analytics.domain;

import static org.junit.jupiter.api.Assertions.*;

import java.time.OffsetDateTime;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.context.SecurityContextHolder;
import com.freightclub.security.TenantContextHolder;

@DisplayName("LoadAnalytics Domain Tests")
class LoadAnalyticsTest {

  private String tenantId;
  private String loadId;
  private String shipperId;
  private OffsetDateTime postedAt;

  @BeforeEach
  void setUp() {
    tenantId = UUID.randomUUID().toString();
    loadId = UUID.randomUUID().toString();
    shipperId = UUID.randomUUID().toString();
    postedAt = OffsetDateTime.now();
  }

  @AfterEach
  void tearDown() {
    TenantContextHolder.clear();
    SecurityContextHolder.clearContext();
  }

  @Test
  @DisplayName("should create analytics record for posted load")
  void testCreate_Posted() {
    LoadAnalytics analytics = LoadAnalytics.recordPosted(tenantId, loadId, shipperId, postedAt, 45, 162);

    assertNotNull(analytics.getId());
    assertEquals(tenantId, analytics.getTenantId());
    assertEquals(loadId, analytics.getLoadId());
    assertEquals(postedAt, analytics.getPostedAt());
    assertNull(analytics.getClaimedAt());
    assertNull(analytics.getClaimTimeSeconds());
    assertEquals(45, analytics.getMatchCount());
    assertEquals(162, analytics.getAvgMatchScore());
  }

  @Test
  @DisplayName("should record claim and calculate time")
  void testRecordClaim() {
    LoadAnalytics analytics = LoadAnalytics.recordPosted(tenantId, loadId, shipperId, postedAt, 45, 162);

    OffsetDateTime claimedAt = postedAt.plusHours(2);
    analytics.recordClaim(claimedAt, UUID.randomUUID().toString());

    assertNotNull(analytics.getClaimedAt());
    assertEquals(claimedAt, analytics.getClaimedAt());
    assertEquals(7200, analytics.getClaimTimeSeconds()); // 2 hours in seconds
  }

  @Test
  @DisplayName("should reject null tenantId")
  void testCreate_NullTenantId() {
    assertThrows(IllegalArgumentException.class, () ->
        LoadAnalytics.recordPosted(null, loadId, postedAt, 45, 162),
        "tenantId cannot be null");
  }

  @Test
  @DisplayName("should reject null loadId")
  void testCreate_NullLoadId() {
    assertThrows(IllegalArgumentException.class, () ->
        LoadAnalytics.recordPosted(tenantId, null, postedAt, 45, 162),
        "loadId cannot be null");
  }

  @Test
  @DisplayName("should calculate claim time in seconds")
  void testClaimTime_Calculation() {
    OffsetDateTime claimedAt = postedAt.plusMinutes(30);
    LoadAnalytics analytics = LoadAnalytics.recordPosted(tenantId, loadId, shipperId, postedAt, 10, 100);
    analytics.recordClaim(claimedAt, UUID.randomUUID().toString());

    assertEquals(1800, analytics.getClaimTimeSeconds()); // 30 minutes = 1800 seconds
  }

  @Test
  @DisplayName("should handle zero claim time")
  void testClaimTime_Immediate() {
    LoadAnalytics analytics = LoadAnalytics.recordPosted(tenantId, loadId, shipperId, postedAt, 10, 100);
    analytics.recordClaim(postedAt, UUID.randomUUID().toString()); // Claimed at same time

    assertEquals(0, analytics.getClaimTimeSeconds());
  }

  @Test
  @DisplayName("should reject invalid match scores")
  void testCreate_InvalidMatchScore() {
    assertThrows(IllegalArgumentException.class, () ->
        LoadAnalytics.recordPosted(tenantId, loadId, postedAt, 10, 0),
        "avgMatchScore must be between 1 and 200");

    assertThrows(IllegalArgumentException.class, () ->
        LoadAnalytics.recordPosted(tenantId, loadId, postedAt, 10, 201),
        "avgMatchScore must be between 1 and 200");
  }

  @Test
  @DisplayName("should soft delete analytics")
  void testSoftDelete() {
    LoadAnalytics analytics = LoadAnalytics.recordPosted(tenantId, loadId, shipperId, postedAt, 45, 162);

    assertNull(analytics.getDeletedAt());
    analytics.softDelete();
    assertNotNull(analytics.getDeletedAt());
  }

  @Test
  @DisplayName("should track match reason distribution")
  void testMatchReasonTracking() {
    MatchReasonDistribution distribution = new MatchReasonDistribution(45, 38, 42, 40);

    assertEquals(45, distribution.equipmentCount());
    assertEquals(38, distribution.laneCount());
    assertEquals(42, distribution.rateCount());
    assertEquals(40, distribution.availabilityCount());
  }
}
