package com.freightclub.modules.carrier.infrastructure;

import com.freightclub.modules.carrier.domain.PreferredCarrier;
import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(
    name = "preferred_carriers",
    indexes = {
      @Index(name = "idx_preferred_shipper", columnList = "tenant_id, shipper_id, deleted_at")
    })
public class PreferredCarrierEntity {
  @Id
  @Column(length = 36)
  private String id;

  @Column(name = "tenant_id", length = 36, nullable = false)
  private String tenantId;

  @Column(name = "shipper_id", length = 36, nullable = false)
  private String shipperId;

  @Column(name = "trucker_id", length = 36, nullable = false)
  private String truckerId;

  @Column(name = "added_at", nullable = false)
  private OffsetDateTime addedAt;

  @Column(name = "deleted_at")
  private OffsetDateTime deletedAt;

  // Constructors
  public PreferredCarrierEntity() {}

  public PreferredCarrierEntity(
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

  public static PreferredCarrierEntity fromDomain(PreferredCarrier domain) {
    return new PreferredCarrierEntity(
        domain.getId(),
        domain.getTenantId(),
        domain.getShipperId(),
        domain.getTruckerId(),
        domain.getAddedAt(),
        domain.getDeletedAt());
  }

  public PreferredCarrier toDomain() {
    return new PreferredCarrier(id, tenantId, shipperId, truckerId, addedAt, deletedAt);
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

  public OffsetDateTime getAddedAt() {
    return addedAt;
  }

  public void setAddedAt(OffsetDateTime addedAt) {
    this.addedAt = addedAt;
  }

  public OffsetDateTime getDeletedAt() {
    return deletedAt;
  }

  public void setDeletedAt(OffsetDateTime deletedAt) {
    this.deletedAt = deletedAt;
  }
}
