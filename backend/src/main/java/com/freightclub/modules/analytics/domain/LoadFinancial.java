package com.freightclub.modules.analytics.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "load_financial", schema = "freightclub")
public class LoadFinancial {

  @Id
  private String id;

  @Column(name = "load_id", nullable = false)
  private String loadId;

  @Column(name = "tenant_id", nullable = false)
  private String tenantId;

  @Column(name = "shipper_id", nullable = false)
  private String shipperId;

  @Column(name = "carrier_id")
  private String carrierId;

  @Column(name = "posted_at", nullable = false)
  private OffsetDateTime postedAt;

  @Column(name = "claimed_at")
  private OffsetDateTime claimedAt;

  @Column(name = "completed_at")
  private OffsetDateTime completedAt;

  @Column(name = "rate_per_mile", nullable = false)
  private BigDecimal ratePerMile;

  @Column(name = "total_revenue", nullable = false)
  private BigDecimal totalRevenue;

  @Column(name = "commission", nullable = false)
  private BigDecimal commission;

  @Column(name = "net_revenue", nullable = false)
  private BigDecimal netRevenue;

  @Column(name = "created_at", nullable = false)
  private OffsetDateTime createdAt;

  public LoadFinancial() {}

  public LoadFinancial(
      String id,
      String loadId,
      String tenantId,
      String shipperId,
      String carrierId,
      OffsetDateTime postedAt,
      BigDecimal ratePerMile,
      BigDecimal totalRevenue) {
    this.id = id;
    this.loadId = loadId;
    this.tenantId = tenantId;
    this.shipperId = shipperId;
    this.carrierId = carrierId;
    this.postedAt = postedAt;
    this.ratePerMile = ratePerMile;
    this.totalRevenue = totalRevenue;
    this.commission = totalRevenue.multiply(BigDecimal.valueOf(0.02));
    this.netRevenue = totalRevenue.subtract(this.commission);
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

  public OffsetDateTime getPostedAt() {
    return postedAt;
  }

  public void setPostedAt(OffsetDateTime postedAt) {
    this.postedAt = postedAt;
  }

  public OffsetDateTime getClaimedAt() {
    return claimedAt;
  }

  public void setClaimedAt(OffsetDateTime claimedAt) {
    this.claimedAt = claimedAt;
  }

  public OffsetDateTime getCompletedAt() {
    return completedAt;
  }

  public void setCompletedAt(OffsetDateTime completedAt) {
    this.completedAt = completedAt;
  }

  public BigDecimal getRatePerMile() {
    return ratePerMile;
  }

  public void setRatePerMile(BigDecimal ratePerMile) {
    this.ratePerMile = ratePerMile;
  }

  public BigDecimal getTotalRevenue() {
    return totalRevenue;
  }

  public void setTotalRevenue(BigDecimal totalRevenue) {
    this.totalRevenue = totalRevenue;
  }

  public BigDecimal getCommission() {
    return commission;
  }

  public void setCommission(BigDecimal commission) {
    this.commission = commission;
  }

  public BigDecimal getNetRevenue() {
    return netRevenue;
  }

  public void setNetRevenue(BigDecimal netRevenue) {
    this.netRevenue = netRevenue;
  }

  public OffsetDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(OffsetDateTime createdAt) {
    this.createdAt = createdAt;
  }
}
