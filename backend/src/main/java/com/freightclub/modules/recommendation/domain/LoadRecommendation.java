package com.freightclub.modules.recommendation.domain;

import java.time.OffsetDateTime;
import java.util.UUID;
import com.fasterxml.jackson.databind.ObjectMapper;

public class LoadRecommendation {
  private final String id;
  private final String tenantId;
  private final String loadId;
  private final String truckerId;
  private final int matchScore;
  private final MatchReason matchReason;
  private final OffsetDateTime createdAt;
  private OffsetDateTime deletedAt;

  public LoadRecommendation(
      String id,
      String tenantId,
      String loadId,
      String truckerId,
      int matchScore,
      MatchReason matchReason,
      OffsetDateTime createdAt,
      OffsetDateTime deletedAt) {
    this.id = id;
    this.tenantId = tenantId;
    this.loadId = loadId;
    this.truckerId = truckerId;
    this.matchScore = matchScore;
    this.matchReason = matchReason;
    this.createdAt = createdAt;
    this.deletedAt = deletedAt;
  }

  public static LoadRecommendation createRecommendation(
      String tenantId,
      String loadId,
      String truckerId,
      int matchScore,
      MatchReason matchReason) {
    if (tenantId == null || tenantId.isBlank()) {
      throw new IllegalArgumentException("tenantId cannot be null");
    }
    if (loadId == null || loadId.isBlank()) {
      throw new IllegalArgumentException("loadId cannot be null");
    }
    if (truckerId == null || truckerId.isBlank()) {
      throw new IllegalArgumentException("truckerId cannot be null");
    }
    if (matchScore < 1 || matchScore > 200) {
      throw new IllegalArgumentException("Score must be between 1 and 200");
    }

    String id = UUID.randomUUID().toString();
    OffsetDateTime createdAt = OffsetDateTime.now();

    return new LoadRecommendation(
        id, tenantId, loadId, truckerId, matchScore, matchReason, createdAt, null);
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

  public String getTruckerId() {
    return truckerId;
  }

  public int getMatchScore() {
    return matchScore;
  }

  public MatchReason getMatchReason() {
    return matchReason;
  }

  public OffsetDateTime getCreatedAt() {
    return createdAt;
  }

  public OffsetDateTime getDeletedAt() {
    return deletedAt;
  }

  public String getMatchReasonJson() {
    try {
      ObjectMapper mapper = new ObjectMapper();
      return mapper.writeValueAsString(matchReason);
    } catch (Exception e) {
      throw new RuntimeException("Failed to serialize MatchReason", e);
    }
  }

  public void setMatchScore(int score) {
    throw new UnsupportedOperationException("LoadRecommendation is immutable");
  }
}
