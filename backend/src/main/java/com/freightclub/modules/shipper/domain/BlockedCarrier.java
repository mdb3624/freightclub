package com.freightclub.modules.shipper.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;

@Entity
@Table(name = "blocked_carriers", schema = "freightclub")
public class BlockedCarrier {

  @Id
  private String id;

  @Column(name = "shipper_id", nullable = false)
  private String shipperId;

  @Column(name = "carrier_id", nullable = false)
  private String carrierId;

  @Column(name = "tenant_id", nullable = false)
  private String tenantId;

  @Column(name = "reason")
  private String reason;

  @Column(name = "created_at", nullable = false)
  private OffsetDateTime createdAt;

  @Column(name = "deleted_at")
  private OffsetDateTime deletedAt;

  public BlockedCarrier() {}

  public BlockedCarrier(
      String id,
      String shipperId,
      String carrierId,
      String tenantId,
      String reason,
      OffsetDateTime createdAt,
      OffsetDateTime deletedAt) {
    this.id = id;
    this.shipperId = shipperId;
    this.carrierId = carrierId;
    this.tenantId = tenantId;
    this.reason = reason;
    this.createdAt = createdAt;
    this.deletedAt = deletedAt;
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getShipperId() {
    return shipperId;
  }

  public void setShipperId(String shipperId) {
    this.shipperId = shipperId;
  }

  public String getCarrierId() {
    return carrierId;
  }

  public void setCarrierId(String carrierId) {
    this.carrierId = carrierId;
  }

  public String getTenantId() {
    return tenantId;
  }

  public void setTenantId(String tenantId) {
    this.tenantId = tenantId;
  }

  public String getReason() {
    return reason;
  }

  public void setReason(String reason) {
    this.reason = reason;
  }

  public OffsetDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(OffsetDateTime createdAt) {
    this.createdAt = createdAt;
  }

  public OffsetDateTime getDeletedAt() {
    return deletedAt;
  }

  public void setDeletedAt(OffsetDateTime deletedAt) {
    this.deletedAt = deletedAt;
  }
}
