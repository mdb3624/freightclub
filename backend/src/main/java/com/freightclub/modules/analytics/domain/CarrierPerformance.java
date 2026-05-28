package com.freightclub.modules.analytics.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "carrier_performance", schema = "freightclub")
public class CarrierPerformance {

  @Id
  private String id;

  @Column(name = "carrier_id", nullable = false)
  private String carrierId;

  @Column(name = "tenant_id", nullable = false)
  private String tenantId;

  @Column(name = "load_assigned", nullable = false)
  private long loadAssigned;

  @Column(name = "load_accepted", nullable = false)
  private long loadAccepted;

  @Column(name = "load_declined", nullable = false)
  private long loadDeclined;

  @Column(name = "acceptance_rate", nullable = false)
  private BigDecimal acceptanceRate;

  @Column(name = "on_time_rate", nullable = false)
  private BigDecimal onTimeRate;

  @Column(name = "avg_delivery_time_hours", nullable = false)
  private BigDecimal avgDeliveryTimeHours;

  @Column(name = "quality_score")
  private BigDecimal qualityScore;

  @Column(name = "rating_count", nullable = false)
  private long ratingCount;

  @Column(name = "preferred_by_count", nullable = false)
  private long preferredByCount;

  @Column(name = "created_at", nullable = false)
  private OffsetDateTime createdAt;

  @Column(name = "updated_at", nullable = false)
  private OffsetDateTime updatedAt;

  public CarrierPerformance() {}

  public CarrierPerformance(
      String id,
      String carrierId,
      String tenantId,
      long loadAssigned,
      long loadAccepted,
      long loadDeclined,
      BigDecimal acceptanceRate,
      BigDecimal onTimeRate,
      BigDecimal avgDeliveryTimeHours,
      BigDecimal qualityScore,
      long ratingCount,
      long preferredByCount) {
    this.id = id;
    this.carrierId = carrierId;
    this.tenantId = tenantId;
    this.loadAssigned = loadAssigned;
    this.loadAccepted = loadAccepted;
    this.loadDeclined = loadDeclined;
    this.acceptanceRate = acceptanceRate;
    this.onTimeRate = onTimeRate;
    this.avgDeliveryTimeHours = avgDeliveryTimeHours;
    this.qualityScore = qualityScore;
    this.ratingCount = ratingCount;
    this.preferredByCount = preferredByCount;
    this.createdAt = OffsetDateTime.now();
    this.updatedAt = OffsetDateTime.now();
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

  public String getTenantId() {
    return tenantId;
  }

  public void setTenantId(String tenantId) {
    this.tenantId = tenantId;
  }

  public long getLoadAssigned() {
    return loadAssigned;
  }

  public void setLoadAssigned(long loadAssigned) {
    this.loadAssigned = loadAssigned;
  }

  public long getLoadAccepted() {
    return loadAccepted;
  }

  public void setLoadAccepted(long loadAccepted) {
    this.loadAccepted = loadAccepted;
  }

  public long getLoadDeclined() {
    return loadDeclined;
  }

  public void setLoadDeclined(long loadDeclined) {
    this.loadDeclined = loadDeclined;
  }

  public BigDecimal getAcceptanceRate() {
    return acceptanceRate;
  }

  public void setAcceptanceRate(BigDecimal acceptanceRate) {
    this.acceptanceRate = acceptanceRate;
  }

  public BigDecimal getOnTimeRate() {
    return onTimeRate;
  }

  public void setOnTimeRate(BigDecimal onTimeRate) {
    this.onTimeRate = onTimeRate;
  }

  public BigDecimal getAvgDeliveryTimeHours() {
    return avgDeliveryTimeHours;
  }

  public void setAvgDeliveryTimeHours(BigDecimal avgDeliveryTimeHours) {
    this.avgDeliveryTimeHours = avgDeliveryTimeHours;
  }

  public BigDecimal getQualityScore() {
    return qualityScore;
  }

  public void setQualityScore(BigDecimal qualityScore) {
    this.qualityScore = qualityScore;
  }

  public long getRatingCount() {
    return ratingCount;
  }

  public void setRatingCount(long ratingCount) {
    this.ratingCount = ratingCount;
  }

  public long getPreferredByCount() {
    return preferredByCount;
  }

  public void setPreferredByCount(long preferredByCount) {
    this.preferredByCount = preferredByCount;
  }

  public OffsetDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(OffsetDateTime createdAt) {
    this.createdAt = createdAt;
  }

  public OffsetDateTime getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(OffsetDateTime updatedAt) {
    this.updatedAt = updatedAt;
  }
}
