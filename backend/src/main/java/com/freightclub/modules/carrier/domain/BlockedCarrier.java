package com.freightclub.modules.carrier.domain;

import java.time.OffsetDateTime;
import java.util.UUID;

public class BlockedCarrier {
  private final String id;
  private final String tenantId;
  private final String shipperId;
  private final String truckerId;
  private final OffsetDateTime blockedAt;
  private OffsetDateTime unblockedAt;
  private OffsetDateTime deletedAt;

  public BlockedCarrier(
      String id,
      String tenantId,
      String shipperId,
      String truckerId,
      OffsetDateTime blockedAt,
      OffsetDateTime unblockedAt,
      OffsetDateTime deletedAt) {
    this.id = id;
    this.tenantId = tenantId;
    this.shipperId = shipperId;
    this.truckerId = truckerId;
    this.blockedAt = blockedAt;
    this.unblockedAt = unblockedAt;
    this.deletedAt = deletedAt;
  }

  public static BlockedCarrier blockCarrier(
      String tenantId, String shipperId, String truckerId) {
    if (tenantId == null || tenantId.isBlank()) {
      throw new IllegalArgumentException("tenantId cannot be null");
    }
    if (shipperId == null || shipperId.isBlank()) {
      throw new IllegalArgumentException("shipperId cannot be null");
    }
    if (truckerId == null || truckerId.isBlank()) {
      throw new IllegalArgumentException("truckerId cannot be null");
    }

    String id = UUID.randomUUID().toString();
    OffsetDateTime blockedAt = OffsetDateTime.now();

    return new BlockedCarrier(id, tenantId, shipperId, truckerId, blockedAt, null, null);
  }

  public void unblock() {
    if (this.unblockedAt == null) {
      this.unblockedAt = OffsetDateTime.now();
    }
  }

  public void softDelete() {
    if (this.deletedAt == null) {
      this.deletedAt = OffsetDateTime.now();
    }
  }

  // Getters
  public String getId() {
    return id;
  }

  public String getTenantId() {
    return tenantId;
  }

  public String getShipperId() {
    return shipperId;
  }

  public String getTruckerId() {
    return truckerId;
  }

  public OffsetDateTime getBlockedAt() {
    return blockedAt;
  }

  public OffsetDateTime getUnblockedAt() {
    return unblockedAt;
  }

  public OffsetDateTime getDeletedAt() {
    return deletedAt;
  }
}
