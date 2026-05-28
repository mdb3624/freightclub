package com.freightclub.modules.analytics.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "lane_analytics_daily", schema = "freightclub")
public class LaneAnalytics {

  @Id
  private String id;

  @Column(name = "tenant_id", nullable = false)
  private String tenantId;

  @Column(name = "origin_region", nullable = false)
  private String originRegion;

  @Column(name = "dest_region", nullable = false)
  private String destRegion;

  @Column(name = "date", nullable = false)
  private LocalDate date;

  @Column(name = "post_count", nullable = false)
  private int postCount;

  @Column(name = "claimed_count", nullable = false)
  private int claimedCount;

  @Column(name = "claim_rate", nullable = false)
  private BigDecimal claimRate;

  @Column(name = "avg_claim_time_seconds")
  private Integer avgClaimTimeSeconds;

  @Column(name = "avg_rate")
  private BigDecimal avgRate;

  @Column(name = "computed_at", nullable = false)
  private OffsetDateTime computedAt;

  public LaneAnalytics() {}

  public LaneAnalytics(
      String id,
      String tenantId,
      String originRegion,
      String destRegion,
      LocalDate date,
      int postCount,
      int claimedCount,
      BigDecimal claimRate,
      Integer avgClaimTimeSeconds,
      BigDecimal avgRate) {
    this.id = id;
    this.tenantId = tenantId;
    this.originRegion = originRegion;
    this.destRegion = destRegion;
    this.date = date;
    this.postCount = postCount;
    this.claimedCount = claimedCount;
    this.claimRate = claimRate;
    this.avgClaimTimeSeconds = avgClaimTimeSeconds;
    this.avgRate = avgRate;
    this.computedAt = OffsetDateTime.now();
  }

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

  public String getOriginRegion() {
    return originRegion;
  }

  public void setOriginRegion(String originRegion) {
    this.originRegion = originRegion;
  }

  public String getDestRegion() {
    return destRegion;
  }

  public void setDestRegion(String destRegion) {
    this.destRegion = destRegion;
  }

  public LocalDate getDate() {
    return date;
  }

  public void setDate(LocalDate date) {
    this.date = date;
  }

  public int getPostCount() {
    return postCount;
  }

  public void setPostCount(int postCount) {
    this.postCount = postCount;
  }

  public int getClaimedCount() {
    return claimedCount;
  }

  public void setClaimedCount(int claimedCount) {
    this.claimedCount = claimedCount;
  }

  public BigDecimal getClaimRate() {
    return claimRate;
  }

  public void setClaimRate(BigDecimal claimRate) {
    this.claimRate = claimRate;
  }

  public Integer getAvgClaimTimeSeconds() {
    return avgClaimTimeSeconds;
  }

  public void setAvgClaimTimeSeconds(Integer avgClaimTimeSeconds) {
    this.avgClaimTimeSeconds = avgClaimTimeSeconds;
  }

  public BigDecimal getAvgRate() {
    return avgRate;
  }

  public void setAvgRate(BigDecimal avgRate) {
    this.avgRate = avgRate;
  }

  public OffsetDateTime getComputedAt() {
    return computedAt;
  }

  public void setComputedAt(OffsetDateTime computedAt) {
    this.computedAt = computedAt;
  }
}
