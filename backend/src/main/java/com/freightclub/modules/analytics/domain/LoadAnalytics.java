package com.freightclub.modules.analytics.domain;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "load_analytics")
public class LoadAnalytics {
  @Id
  private String id;

  @Column(name = "tenant_id", nullable = false)
  private String tenantId;

  @Column(name = "load_id", nullable = false)
  private String loadId;

  @Column(name = "posted_at", nullable = false)
  private OffsetDateTime postedAt;

  @Column(name = "claimed_at")
  private OffsetDateTime claimedAt;

  @Column(name = "claim_time_seconds")
  private Integer claimTimeSeconds;

  @Column(name = "match_count", nullable = false)
  private int matchCount;

  @Column(name = "avg_match_score", nullable = false)
  private int avgMatchScore;

  @Column(name = "claimed_by_trucker_id")
  private String claimedByTruckerId;

  @Column(name = "deleted_at")
  private OffsetDateTime deletedAt;

  @Column(name = "shipper_id")
  private String shipperId;

  protected LoadAnalytics() {
    // JPA no-arg constructor
  }

  public LoadAnalytics(
      String id,
      String tenantId,
      String loadId,
      String shipperId,
      OffsetDateTime postedAt,
      OffsetDateTime claimedAt,
      Integer claimTimeSeconds,
      int matchCount,
      int avgMatchScore,
      String claimedByTruckerId,
      OffsetDateTime deletedAt) {
    this.id = id;
    this.tenantId = tenantId;
    this.loadId = loadId;
    this.shipperId = shipperId;
    this.postedAt = postedAt;
    this.claimedAt = claimedAt;
    this.claimTimeSeconds = claimTimeSeconds;
    this.matchCount = matchCount;
    this.avgMatchScore = avgMatchScore;
    this.claimedByTruckerId = claimedByTruckerId;
    this.deletedAt = deletedAt;
  }

  public static LoadAnalytics recordPosted(
      String tenantId, String loadId, String shipperId, OffsetDateTime postedAt, int matchCount, int avgMatchScore) {
    if (tenantId == null || tenantId.isBlank()) {
      throw new IllegalArgumentException("tenantId cannot be null");
    }
    if (loadId == null || loadId.isBlank()) {
      throw new IllegalArgumentException("loadId cannot be null");
    }
    if (avgMatchScore < 1 || avgMatchScore > 200) {
      throw new IllegalArgumentException("avgMatchScore must be between 1 and 200");
    }

    return new LoadAnalytics(
        UUID.randomUUID().toString(),
        tenantId,
        loadId,
        shipperId,
        postedAt,
        null,
        null,
        matchCount,
        avgMatchScore,
        null,
        null);
  }

  public void recordClaim(OffsetDateTime claimedAt, String truckerId) {
    if (this.claimedAt == null) {
      this.claimedAt = claimedAt;
      this.claimedByTruckerId = truckerId;
      this.claimTimeSeconds =
          (int) ((claimedAt.toInstant().toEpochMilli()
                  - postedAt.toInstant().toEpochMilli())
              / 1000);
    }
  }

  public void softDelete() {
    if (this.deletedAt == null) {
      this.deletedAt = OffsetDateTime.now();
    }
  }

  // Getters
  public String getId() {
    return id;
  }

  public String getTenantId() {
    return tenantId;
  }

  public String getLoadId() {
    return loadId;
  }

  public OffsetDateTime getPostedAt() {
    return postedAt;
  }

  public OffsetDateTime getClaimedAt() {
    return claimedAt;
  }

  public Integer getClaimTimeSeconds() {
    return claimTimeSeconds;
  }

  public int getMatchCount() {
    return matchCount;
  }

  public int getAvgMatchScore() {
    return avgMatchScore;
  }

  public String getClaimedByTruckerId() {
    return claimedByTruckerId;
  }

  public OffsetDateTime getDeletedAt() {
    return deletedAt;
  }

  public String getShipperId() {
    return shipperId;
  }
}
