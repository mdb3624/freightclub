package com.freightclub.modules.carrier.infrastructure;

import com.freightclub.modules.carrier.domain.BlockedCarrier;
import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(
    name = "blocked_carriers",
    indexes = {@Index(name = "idx_blocked_shipper", columnList = "tenant_id, shipper_id")})
public class BlockedCarrierEntity {
  @Id
  @Column(length = 36)
  private String id;

  @Column(name = "tenant_id", length = 36, nullable = false)
  private String tenantId;

  @Column(name = "shipper_id", length = 36, nullable = false)
  private String shipperId;

  @Column(name = "trucker_id", length = 36, nullable = false)
  private String truckerId;

  @Column(name = "blocked_at", nullable = false)
  private OffsetDateTime blockedAt;

  @Column(name = "unblocked_at")
  private OffsetDateTime unblockedAt;

  @Column(name = "deleted_at")
  private OffsetDateTime deletedAt;

  // Constructors
  public BlockedCarrierEntity() {}

  public BlockedCarrierEntity(
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

  public static BlockedCarrierEntity fromDomain(BlockedCarrier domain) {
    return new BlockedCarrierEntity(
        domain.getId(),
        domain.getTenantId(),
        domain.getShipperId(),
        domain.getTruckerId(),
        domain.getBlockedAt(),
        domain.getUnblockedAt(),
        domain.getDeletedAt());
  }

  public BlockedCarrier toDomain() {
    return new BlockedCarrier(id, tenantId, shipperId, truckerId, blockedAt, unblockedAt, deletedAt);
  }

  // Getters and Setters
  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getTenantId() {
    return tenantId;
  }

  public void setTenantId(String tenantId) {
    this.tenantId = tenantId;
  }

  public String getShipperId() {
    return shipperId;
  }

  public void setShipperId(String shipperId) {
    this.shipperId = shipperId;
  }

  public String getTruckerId() {
    return truckerId;
  }

  public void setTruckerId(String truckerId) {
    this.truckerId = truckerId;
  }

  public OffsetDateTime getBlockedAt() {
    return blockedAt;
  }

  public void setBlockedAt(OffsetDateTime blockedAt) {
    this.blockedAt = blockedAt;
  }

  public OffsetDateTime getUnblockedAt() {
    return unblockedAt;
  }

  public void setUnblockedAt(OffsetDateTime unblockedAt) {
    this.unblockedAt = unblockedAt;
  }

  public OffsetDateTime getDeletedAt() {
    return deletedAt;
  }

  public void setDeletedAt(OffsetDateTime deletedAt) {
    this.deletedAt = deletedAt;
  }
}
