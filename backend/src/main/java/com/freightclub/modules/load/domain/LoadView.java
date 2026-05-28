package com.freightclub.modules.load.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;

@Entity
@Table(name = "load_views", schema = "freightclub")
public class LoadView {

  @Id
  private String id;

  @Column(name = "load_id", nullable = false)
  private String loadId;

  @Column(name = "carrier_id", nullable = false)
  private String carrierId;

  @Column(name = "tenant_id", nullable = false)
  private String tenantId;

  @Column(name = "viewed_at", nullable = false)
  private OffsetDateTime viewedAt;

  @Column(name = "created_at", nullable = false)
  private OffsetDateTime createdAt;

  public LoadView() {}

  public LoadView(
      String id,
      String loadId,
      String carrierId,
      String tenantId) {
    this.id = id;
    this.loadId = loadId;
    this.carrierId = carrierId;
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

  public String getLoadId() {
    return loadId;
  }

  public void setLoadId(String loadId) {
    this.loadId = loadId;
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
