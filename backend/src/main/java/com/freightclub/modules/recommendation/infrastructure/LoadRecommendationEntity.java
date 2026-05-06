package com.freightclub.modules.recommendation.infrastructure;

import com.freightclub.modules.recommendation.domain.LoadRecommendation;
import com.freightclub.modules.recommendation.domain.MatchReason;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.OffsetDateTime;

@Entity
@Table(
    name = "load_recommendations",
    indexes = {
      @Index(name = "idx_recommendations_trucker", columnList = "tenant_id, trucker_id, deleted_at"),
      @Index(name = "idx_recommendations_load", columnList = "load_id, deleted_at"),
      @Index(name = "idx_recommendations_score", columnList = "match_score DESC")
    })
public class LoadRecommendationEntity {
  @Id
  @Column(length = 36)
  private String id;

  @Column(name = "tenant_id", length = 36, nullable = false)
  private String tenantId;

  @Column(name = "load_id", length = 36, nullable = false)
  private String loadId;

  @Column(name = "trucker_id", length = 36, nullable = false)
  private String truckerId;

  @Column(name = "match_score", nullable = false)
  private int matchScore;

  @Column(name = "match_reason")
  @JdbcTypeCode(SqlTypes.JSON)
  private String matchReasonJson;

  @Column(name = "created_at", nullable = false)
  private OffsetDateTime createdAt;

  @Column(name = "deleted_at")
  private OffsetDateTime deletedAt;

  // Constructors
  public LoadRecommendationEntity() {}

  public LoadRecommendationEntity(
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
    this.matchReasonJson = serializeMatchReason(matchReason);
    this.createdAt = createdAt;
    this.deletedAt = deletedAt;
  }

  public static LoadRecommendationEntity fromDomain(LoadRecommendation domain) {
    return new LoadRecommendationEntity(
        domain.getId(),
        domain.getTenantId(),
        domain.getLoadId(),
        domain.getTruckerId(),
        domain.getMatchScore(),
        domain.getMatchReason(),
        domain.getCreatedAt(),
        domain.getDeletedAt());
  }

  public LoadRecommendation toDomain() {
    return new LoadRecommendation(
        id, tenantId, loadId, truckerId, matchScore, deserializeMatchReason(matchReasonJson), createdAt, deletedAt);
  }

  private static String serializeMatchReason(MatchReason reason) {
    try {
      return new ObjectMapper()
          .writeValueAsString(reason);
    } catch (Exception e) {
      throw new RuntimeException("Failed to serialize MatchReason", e);
    }
  }

  private static MatchReason deserializeMatchReason(String json) {
    try {
      return new ObjectMapper()
          .readValue(json, MatchReason.class);
    } catch (Exception e) {
      throw new RuntimeException("Failed to deserialize MatchReason", e);
    }
  }

  // Getters and Setters
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

  public String getLoadId() {
    return loadId;
  }

  public void setLoadId(String loadId) {
    this.loadId = loadId;
  }

  public String getTruckerId() {
    return truckerId;
  }

  public void setTruckerId(String truckerId) {
    this.truckerId = truckerId;
  }

  public int getMatchScore() {
    return matchScore;
  }

  public void setMatchScore(int matchScore) {
    this.matchScore = matchScore;
  }

  public String getMatchReasonJson() {
    return matchReasonJson;
  }

  public void setMatchReasonJson(String matchReasonJson) {
    this.matchReasonJson = matchReasonJson;
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
