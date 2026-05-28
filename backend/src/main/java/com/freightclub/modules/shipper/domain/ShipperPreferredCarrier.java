package com.freightclub.modules.shipper.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;

@Entity
@Table(name = "shipper_preferred_carriers", schema = "freightclub")
public class ShipperPreferredCarrier {

  @Id
  private String id;

  @Column(name = "shipper_id", nullable = false)
  private String shipperId;

  @Column(name = "carrier_id", nullable = false)
  private String carrierId;

  @Column(name = "tenant_id", nullable = false)
  private String tenantId;

  @Column(name = "notes", columnDefinition = "TEXT")
  private String notes;

  @Column(name = "created_at", nullable = false)
  private OffsetDateTime createdAt;

  @Column(name = "deleted_at")
  private OffsetDateTime deletedAt;

  public ShipperPreferredCarrier() {}

  public ShipperPreferredCarrier(
      String id,
      String shipperId,
      String carrierId,
      String tenantId,
      String notes) {
    this.id = id;
    this.shipperId = shipperId;
    this.carrierId = carrierId;
    this.tenantId = tenantId;
    this.notes = notes;
    this.createdAt = OffsetDateTime.now();
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

  public String getNotes() {
    return notes;
  }

  public void setNotes(String notes) {
    this.notes = notes;
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
