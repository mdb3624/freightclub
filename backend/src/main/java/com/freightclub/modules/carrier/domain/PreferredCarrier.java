package com.freightclub.modules.carrier.domain;

import java.time.OffsetDateTime;
import java.util.UUID;

public class PreferredCarrier {
  private final String id;
  private final String tenantId;
  private final String shipperId;
  private final String truckerId;
  private final OffsetDateTime addedAt;
  private OffsetDateTime deletedAt;

  public PreferredCarrier(
      String id,
      String tenantId,
      String shipperId,
      String truckerId,
      OffsetDateTime addedAt,
      OffsetDateTime deletedAt) {
    this.id = id;
    this.tenantId = tenantId;
    this.shipperId = shipperId;
    this.truckerId = truckerId;
    this.addedAt = addedAt;
    this.deletedAt = deletedAt;
  }

  public static PreferredCarrier createPreferred(
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
    OffsetDateTime addedAt = OffsetDateTime.now();

    return new PreferredCarrier(id, tenantId, shipperId, truckerId, addedAt, null);
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

  public OffsetDateTime getAddedAt() {
    return addedAt;
  }

  public OffsetDateTime getDeletedAt() {
    return deletedAt;
  }
}
