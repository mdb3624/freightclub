package com.freightclub.modules.analytics.domain;

import java.time.OffsetDateTime;
import java.util.UUID;

public class LoadAnalytics {
  private final String id;
  private final String tenantId;
  private final String loadId;
  private final OffsetDateTime postedAt;
  private OffsetDateTime claimedAt;
  private Integer claimTimeSeconds;
  private final int matchCount;
  private final int avgMatchScore;
  private String claimedByTruckerId;
  private OffsetDateTime deletedAt;

  public LoadAnalytics(
      String id,
      String tenantId,
      String loadId,
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
    this.postedAt = postedAt;
    this.claimedAt = claimedAt;
    this.claimTimeSeconds = claimTimeSeconds;
    this.matchCount = matchCount;
    this.avgMatchScore = avgMatchScore;
    this.claimedByTruckerId = claimedByTruckerId;
    this.deletedAt = deletedAt;
  }

  public static LoadAnalytics recordPosted(
      String tenantId, String loadId, OffsetDateTime postedAt, int matchCount, int avgMatchScore) {
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
}
