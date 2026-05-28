package com.freightclub.modules.carrier.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;

@Entity
@Table(name = "carrier_profile_views", schema = "freightclub")
public class CarrierProfileView {

  @Id
  private String id;

  @Column(name = "carrier_id", nullable = false)
  private String carrierId;

  @Column(name = "shipper_id", nullable = false)
  private String shipperId;

  @Column(name = "tenant_id", nullable = false)
  private String tenantId;

  @Column(name = "viewed_at", nullable = false)
  private OffsetDateTime viewedAt;

  @Column(name = "created_at", nullable = false)
  private OffsetDateTime createdAt;

  public CarrierProfileView() {}

  public CarrierProfileView(
      String id,
      String carrierId,
      String shipperId,
      String tenantId) {
    this.id = id;
    this.carrierId = carrierId;
    this.shipperId = shipperId;
    this.tenantId = tenantId;
    this.viewedAt = OffsetDateTime.now();
    this.createdAt = OffsetDateTime.now();
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getCarrierId() {
    return carrierId;
  }

  public void setCarrierId(String carrierId) {
    this.carrierId = carrierId;
  }

  public String getShipperId() {
    return shipperId;
  }

  public void setShipperId(String shipperId) {
    this.shipperId = shipperId;
  }

  public String getTenantId() {
    return tenantId;
  }

  public void setTenantId(String tenantId) {
    this.tenantId = tenantId;
  }

  public OffsetDateTime getViewedAt() {
    return viewedAt;
  }

  public void setViewedAt(OffsetDateTime viewedAt) {
    this.viewedAt = viewedAt;
  }

  public OffsetDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(OffsetDateTime createdAt) {
    this.createdAt = createdAt;
  }
}
