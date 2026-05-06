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

@DisplayName("PreferredCarrier Domain Tests")
class PreferredCarrierTest {

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
  @DisplayName("should create preferred carrier relationship")
  void testCreatePreferredCarrier() {
    PreferredCarrier preferred = PreferredCarrier.createPreferred(tenantId, shipperId, truckerId);

    assertNotNull(preferred.getId());
    assertEquals(tenantId, preferred.getTenantId());
    assertEquals(shipperId, preferred.getShipperId());
    assertEquals(truckerId, preferred.getTruckerId());
    assertNotNull(preferred.getAddedAt());
    assertNull(preferred.getDeletedAt());
  }

  @Test
  @DisplayName("should reject null tenantId")
  void testCreatePreferredCarrier_NullTenantId() {
    assertThrows(IllegalArgumentException.class, () ->
        PreferredCarrier.createPreferred(null, shipperId, truckerId),
        "tenantId cannot be null");
  }

  @Test
  @DisplayName("should reject null shipperId")
  void testCreatePreferredCarrier_NullShipperId() {
    assertThrows(IllegalArgumentException.class, () ->
        PreferredCarrier.createPreferred(tenantId, null, truckerId),
        "shipperId cannot be null");
  }

  @Test
  @DisplayName("should reject null truckerId")
  void testCreatePreferredCarrier_NullTruckerId() {
    assertThrows(IllegalArgumentException.class, () ->
        PreferredCarrier.createPreferred(tenantId, shipperId, null),
        "truckerId cannot be null");
  }

  @Test
  @DisplayName("should soft delete preferred carrier")
  void testSoftDelete() {
    PreferredCarrier preferred = PreferredCarrier.createPreferred(tenantId, shipperId, truckerId);

    assertNull(preferred.getDeletedAt());
    preferred.softDelete();
    assertNotNull(preferred.getDeletedAt());
  }

  @Test
  @DisplayName("should prevent duplicate soft deletes")
  void testSoftDelete_Idempotent() {
    PreferredCarrier preferred = PreferredCarrier.createPreferred(tenantId, shipperId, truckerId);

    preferred.softDelete();
    OffsetDateTime firstDelete = preferred.getDeletedAt();

    preferred.softDelete();
    OffsetDateTime secondDelete = preferred.getDeletedAt();

    assertEquals(firstDelete, secondDelete);
  }
}
