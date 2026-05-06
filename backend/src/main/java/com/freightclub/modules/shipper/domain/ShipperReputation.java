package com.freightclub.modules.shipper.domain;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

public class ShipperReputation {

  private String id;
  private String tenantId;
  private String shipperId;
  private BigDecimal averagePaymentSpeedDays; // avg(payment_confirmed_at - delivered_at) last 90 days
  private int completedLoadCount;             // total delivered loads
  private int cancelledLoadCount;             // loads cancelled while CLAIMED
  private int openDisputeCount;               // open/flagged payment disputes
  private OffsetDateTime lastCalculatedAt;
  private OffsetDateTime createdAt;
  private OffsetDateTime updatedAt;
  private OffsetDateTime deletedAt;

  public ShipperReputation() {}

  public ShipperReputation(
      String id,
      String tenantId,
      String shipperId,
      BigDecimal averagePaymentSpeedDays,
      int completedLoadCount,
      int cancelledLoadCount,
      int openDisputeCount,
      OffsetDateTime lastCalculatedAt,
      OffsetDateTime createdAt,
      OffsetDateTime updatedAt,
      OffsetDateTime deletedAt) {
    this.id = id;
    this.tenantId = tenantId;
    this.shipperId = shipperId;
    this.averagePaymentSpeedDays = averagePaymentSpeedDays;
    this.completedLoadCount = completedLoadCount;
    this.cancelledLoadCount = cancelledLoadCount;
    this.openDisputeCount = openDisputeCount;
    this.lastCalculatedAt = lastCalculatedAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
  }

  public static ShipperReputation createNew(
      String tenantId,
      String shipperId,
      BigDecimal averagePaymentSpeedDays,
      int completedLoadCount,
      int cancelledLoadCount,
      int openDisputeCount) {
    return new ShipperReputation(
        java.util.UUID.randomUUID().toString(),
        tenantId,
        shipperId,
        averagePaymentSpeedDays,
        completedLoadCount,
        cancelledLoadCount,
        openDisputeCount,
        OffsetDateTime.now(ZoneOffset.UTC),
        OffsetDateTime.now(ZoneOffset.UTC),
        OffsetDateTime.now(ZoneOffset.UTC),
        null);
  }

  public void updateMetrics(
      BigDecimal averagePaymentSpeedDays,
      int completedLoadCount,
      int cancelledLoadCount,
      int openDisputeCount) {
    this.averagePaymentSpeedDays = averagePaymentSpeedDays;
    this.completedLoadCount = completedLoadCount;
    this.cancelledLoadCount = cancelledLoadCount;
    this.openDisputeCount = openDisputeCount;
    this.lastCalculatedAt = OffsetDateTime.now(ZoneOffset.UTC);
    this.updatedAt = OffsetDateTime.now(ZoneOffset.UTC);
  }

  public void softDelete() {
    this.deletedAt = OffsetDateTime.now(ZoneOffset.UTC);
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
  public String getTenantId() { return tenantId; }
  public String getShipperId() { return shipperId; }
  public BigDecimal getAveragePaymentSpeedDays() { return averagePaymentSpeedDays; }
  public int getCompletedLoadCount() { return completedLoadCount; }
  public int getCancelledLoadCount() { return cancelledLoadCount; }
  public int getOpenDisputeCount() { return openDisputeCount; }
  public OffsetDateTime getLastCalculatedAt() { return lastCalculatedAt; }
  public OffsetDateTime getCreatedAt() { return createdAt; }
  public OffsetDateTime getUpdatedAt() { return updatedAt; }
  public OffsetDateTime getDeletedAt() { return deletedAt; }
}
