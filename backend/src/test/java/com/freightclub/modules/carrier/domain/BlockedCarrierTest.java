package com.freightclub.modules.carrier.domain;

import static org.junit.jupiter.api.Assertions.*;

import java.time.OffsetDateTime;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.context.SecurityContextHolder;
import com.freightclub.security.TenantContextHolder;

@DisplayName("BlockedCarrier Domain Tests")
class BlockedCarrierTest {

  private String tenantId;
  private String shipperId;
  private String truckerId;

  @BeforeEach
  void setUp() {
    tenantId = UUID.randomUUID().toString();
    shipperId = UUID.randomUUID().toString();
    truckerId = UUID.randomUUID().toString();
  }

  @AfterEach
  void tearDown() {
    TenantContextHolder.clear();
    SecurityContextHolder.clearContext();
  }

  @Test
  @DisplayName("should create blocked carrier relationship")
  void testCreateBlockedCarrier() {
    BlockedCarrier blocked = BlockedCarrier.blockCarrier(tenantId, shipperId, truckerId);

    assertNotNull(blocked.getId());
    assertEquals(tenantId, blocked.getTenantId());
    assertEquals(shipperId, blocked.getShipperId());
    assertEquals(truckerId, blocked.getTruckerId());
    assertNotNull(blocked.getBlockedAt());
    assertNull(blocked.getUnblockedAt());
    assertNull(blocked.getDeletedAt());
  }

  @Test
  @DisplayName("should reject null tenantId")
  void testCreateBlockedCarrier_NullTenantId() {
    assertThrows(IllegalArgumentException.class, () ->
        BlockedCarrier.blockCarrier(null, shipperId, truckerId),
        "tenantId cannot be null");
  }

  @Test
  @DisplayName("should reject null shipperId")
  void testCreateBlockedCarrier_NullShipperId() {
    assertThrows(IllegalArgumentException.class, () ->
        BlockedCarrier.blockCarrier(tenantId, null, truckerId),
        "shipperId cannot be null");
  }

  @Test
  @DisplayName("should reject null truckerId")
  void testCreateBlockedCarrier_NullTruckerId() {
    assertThrows(IllegalArgumentException.class, () ->
        BlockedCarrier.blockCarrier(tenantId, shipperId, null),
        "truckerId cannot be null");
  }

  @Test
  @DisplayName("should unblock carrier")
  void testUnblock() {
    BlockedCarrier blocked = BlockedCarrier.blockCarrier(tenantId, shipperId, truckerId);

    assertNull(blocked.getUnblockedAt());
    blocked.unblock();
    assertNotNull(blocked.getUnblockedAt());
  }

  @Test
  @DisplayName("should soft delete blocked carrier")
  void testSoftDelete() {
    BlockedCarrier blocked = BlockedCarrier.blockCarrier(tenantId, shipperId, truckerId);

    assertNull(blocked.getDeletedAt());
    blocked.softDelete();
    assertNotNull(blocked.getDeletedAt());
  }
}
