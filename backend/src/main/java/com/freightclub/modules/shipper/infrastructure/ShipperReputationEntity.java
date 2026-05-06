package com.freightclub.modules.shipper.infrastructure;

import com.freightclub.modules.shipper.domain.ShipperReputation;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "shipper_reputation")
public class ShipperReputationEntity {

  @Id private String id;

  @Column(nullable = false)
  private String tenantId;

  @Column(nullable = false)
  private String shipperId;

  @Column(nullable = true)
  private BigDecimal averagePaymentSpeedDays;

  @Column(nullable = false)
  private int completedLoadCount;

  @Column(nullable = false)
  private int cancelledLoadCount;

  @Column(nullable = false)
  private int openDisputeCount;

  @Column(nullable = true)
  private OffsetDateTime lastCalculatedAt;

  @Column(nullable = false)
  private OffsetDateTime createdAt;

  @Column(nullable = false)
  private OffsetDateTime updatedAt;

  @Column(nullable = true)
  private OffsetDateTime deletedAt;

  public ShipperReputationEntity() {}

  public ShipperReputationEntity(ShipperReputation reputation) {
    this.id = reputation.getId();
    this.tenantId = reputation.getTenantId();
    this.shipperId = reputation.getShipperId();
    this.averagePaymentSpeedDays = reputation.getAveragePaymentSpeedDays();
    this.completedLoadCount = reputation.getCompletedLoadCount();
    this.cancelledLoadCount = reputation.getCancelledLoadCount();
    this.openDisputeCount = reputation.getOpenDisputeCount();
    this.lastCalculatedAt = reputation.getLastCalculatedAt();
    this.createdAt = reputation.getCreatedAt();
    this.updatedAt = reputation.getUpdatedAt();
    this.deletedAt = reputation.getDeletedAt();
  }

  public static ShipperReputationEntity fromDomain(ShipperReputation reputation) {
    return new ShipperReputationEntity(reputation);
  }

  public ShipperReputation toDomain() {
    return new ShipperReputation(
        id,
        tenantId,
        shipperId,
        averagePaymentSpeedDays,
        completedLoadCount,
        cancelledLoadCount,
        openDisputeCount,
        lastCalculatedAt,
        createdAt,
        updatedAt,
        deletedAt);
  }

  public boolean hasHighRiskFlags() {
    return cancelledLoadCount > 2 || openDisputeCount > 2;
  }

  public boolean isNewShipper() {
    return completedLoadCount < 3;
  }

  public String getPaymentSpeedLabel() {
    if (completedLoadCount == 0) {
      return "New shipper — no rating yet";
    }
    if (averagePaymentSpeedDays == null) {
      return "No completed payments";
    }
    int days = averagePaymentSpeedDays.intValue();
    return String.format("Typically pays in %d day%s", days, days == 1 ? "" : "s");
  }

  public String getId() { return id; }
  public void setId(String id) { this.id = id; }
  public String getTenantId() { return tenantId; }
  public void setTenantId(String tenantId) { this.tenantId = tenantId; }
  public String getShipperId() { return shipperId; }
  public void setShipperId(String shipperId) { this.shipperId = shipperId; }
  public BigDecimal getAveragePaymentSpeedDays() { return averagePaymentSpeedDays; }
  public void setAveragePaymentSpeedDays(BigDecimal averagePaymentSpeedDays) { this.averagePaymentSpeedDays = averagePaymentSpeedDays; }
  public int getCompletedLoadCount() { return completedLoadCount; }
  public void setCompletedLoadCount(int completedLoadCount) { this.completedLoadCount = completedLoadCount; }
  public int getCancelledLoadCount() { return cancelledLoadCount; }
  public void setCancelledLoadCount(int cancelledLoadCount) { this.cancelledLoadCount = cancelledLoadCount; }
  public int getOpenDisputeCount() { return openDisputeCount; }
  public void setOpenDisputeCount(int openDisputeCount) { this.openDisputeCount = openDisputeCount; }
  public OffsetDateTime getLastCalculatedAt() { return lastCalculatedAt; }
  public void setLastCalculatedAt(OffsetDateTime lastCalculatedAt) { this.lastCalculatedAt = lastCalculatedAt; }
  public OffsetDateTime getCreatedAt() { return createdAt; }
  public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
  public OffsetDateTime getUpdatedAt() { return updatedAt; }
  public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
  public OffsetDateTime getDeletedAt() { return deletedAt; }
  public void setDeletedAt(OffsetDateTime deletedAt) { this.deletedAt = deletedAt; }
}
