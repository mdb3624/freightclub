package com.freightclub.modules.load.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;

@Entity
@Table(name = "load_assignments", schema = "freightclub")
public class LoadAssignment {

  @Id
  private String id;

  @Column(name = "load_id", nullable = false)
  private String loadId;

  @Column(name = "tenant_id", nullable = false)
  private String tenantId;

  @Column(name = "assigned_carrier_id", nullable = false)
  private String assignedCarrierId;

  @Column(name = "assigned_by_shipper_id", nullable = false)
  private String assignedByShipperId;

  @Column(name = "assigned_at", nullable = false)
  private OffsetDateTime assignedAt;

  @Column(name = "accepted_at")
  private OffsetDateTime acceptedAt;

  @Column(name = "accepted_by_carrier")
  private Boolean acceptedByCarrier;

  @Column(name = "created_at", nullable = false)
  private OffsetDateTime createdAt;

  @Column(name = "deleted_at")
  private OffsetDateTime deletedAt;

  public LoadAssignment() {}

  public LoadAssignment(
      String id,
      String loadId,
      String tenantId,
      String assignedCarrierId,
      String assignedByShipperId) {
    this.id = id;
    this.loadId = loadId;
    this.tenantId = tenantId;
    this.assignedCarrierId = assignedCarrierId;
    this.assignedByShipperId = assignedByShipperId;
    this.assignedAt = OffsetDateTime.now();
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

  public String getTenantId() {
    return tenantId;
  }

  public void setTenantId(String tenantId) {
    this.tenantId = tenantId;
  }

  public String getAssignedCarrierId() {
    return assignedCarrierId;
  }

  public void setAssignedCarrierId(String assignedCarrierId) {
    this.assignedCarrierId = assignedCarrierId;
  }

  public String getAssignedByShipperId() {
    return assignedByShipperId;
  }

  public void setAssignedByShipperId(String assignedByShipperId) {
    this.assignedByShipperId = assignedByShipperId;
  }

  public OffsetDateTime getAssignedAt() {
    return assignedAt;
  }

  public void setAssignedAt(OffsetDateTime assignedAt) {
    this.assignedAt = assignedAt;
  }

  public OffsetDateTime getAcceptedAt() {
    return acceptedAt;
  }

  public void setAcceptedAt(OffsetDateTime acceptedAt) {
    this.acceptedAt = acceptedAt;
  }

  public Boolean getAcceptedByCarrier() {
    return acceptedByCarrier;
  }

  public void setAcceptedByCarrier(Boolean acceptedByCarrier) {
    this.acceptedByCarrier = acceptedByCarrier;
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
