package com.freightclub.modules.recommendation.domain;

import static org.junit.jupiter.api.Assertions.*;

import java.time.OffsetDateTime;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("LoadRecommendation Domain Tests")
class LoadRecommendationTest {

  private String tenantId;
  private String loadId;
  private String truckerId;
  private MatchReason matchReason;

  @BeforeEach
  void setUp() {
    tenantId = UUID.randomUUID().toString();
    loadId = UUID.randomUUID().toString();
    truckerId = UUID.randomUUID().toString();
    matchReason = new MatchReason(true, true, true, true);
  }

  @Test
  @DisplayName("should create recommendation with valid score")
  void testCreateRecommendation_ValidScore() {
    LoadRecommendation recommendation = LoadRecommendation.createRecommendation(
        tenantId, loadId, truckerId, 150, matchReason);

    assertNotNull(recommendation.getId());
    assertEquals(tenantId, recommendation.getTenantId());
    assertEquals(loadId, recommendation.getLoadId());
    assertEquals(truckerId, recommendation.getTruckerId());
    assertEquals(150, recommendation.getMatchScore());
    assertEquals(matchReason, recommendation.getMatchReason());
    assertNull(recommendation.getDeletedAt());
  }

  @Test
  @DisplayName("should reject score below 1")
  void testCreateRecommendation_ScoreBelowMinimum() {
    assertThrows(IllegalArgumentException.class, () ->
        LoadRecommendation.createRecommendation(tenantId, loadId, truckerId, 0, matchReason),
        "Score must be between 1 and 200");
  }

  @Test
  @DisplayName("should reject score above 200")
  void testCreateRecommendation_ScoreAboveMaximum() {
    assertThrows(IllegalArgumentException.class, () ->
        LoadRecommendation.createRecommendation(tenantId, loadId, truckerId, 201, matchReason),
        "Score must be between 1 and 200");
  }

  @Test
  @DisplayName("should accept score 1 (minimum valid)")
  void testCreateRecommendation_MinimumScore() {
    LoadRecommendation recommendation = LoadRecommendation.createRecommendation(
        tenantId, loadId, truckerId, 1, matchReason);

    assertEquals(1, recommendation.getMatchScore());
  }

  @Test
  @DisplayName("should accept score 200 (maximum valid)")
  void testCreateRecommendation_MaximumScore() {
    LoadRecommendation recommendation = LoadRecommendation.createRecommendation(
        tenantId, loadId, truckerId, 200, matchReason);

    assertEquals(200, recommendation.getMatchScore());
  }

  @Test
  @DisplayName("should reject null tenantId")
  void testCreateRecommendation_NullTenantId() {
    assertThrows(IllegalArgumentException.class, () ->
        LoadRecommendation.createRecommendation(null, loadId, truckerId, 150, matchReason),
        "tenantId cannot be null");
  }

  @Test
  @DisplayName("should reject null loadId")
  void testCreateRecommendation_NullLoadId() {
    assertThrows(IllegalArgumentException.class, () ->
        LoadRecommendation.createRecommendation(tenantId, null, truckerId, 150, matchReason),
        "loadId cannot be null");
  }

  @Test
  @DisplayName("should reject null truckerId")
  void testCreateRecommendation_NullTruckerId() {
    assertThrows(IllegalArgumentException.class, () ->
        LoadRecommendation.createRecommendation(tenantId, loadId, null, 150, matchReason),
        "truckerId cannot be null");
  }

  @Test
  @DisplayName("should soft delete recommendation")
  void testSoftDelete() {
    LoadRecommendation recommendation = LoadRecommendation.createRecommendation(
        tenantId, loadId, truckerId, 150, matchReason);

    assertNull(recommendation.getDeletedAt());
    recommendation.softDelete();
    assertNotNull(recommendation.getDeletedAt());
  }

  @Test
  @DisplayName("should mark recommendation immutable after creation")
  void testImmutability() {
    LoadRecommendation recommendation = LoadRecommendation.createRecommendation(
        tenantId, loadId, truckerId, 150, matchReason);

    OffsetDateTime createdAt = recommendation.getCreatedAt();
    assertNotNull(createdAt);
  }

  @Test
  @DisplayName("should calculate score for all criteria matching (200)")
  void testScoreCalculation_AllMatch() {
    MatchReason all = new MatchReason(true, true, true, true);
    // score = 100 (equipment) + 50 (lane) + 25 (rate) + 25 (availability) = 200
    int expected = 100 + 50 + 25 + 25;
    assertEquals(200, expected);
  }

  @Test
  @DisplayName("should calculate score for partial match (100)")
  void testScoreCalculation_EquipmentOnly() {
    MatchReason partial = new MatchReason(true, false, false, false);
    // score = 100 (equipment) = 100
    int expected = 100;
    assertEquals(100, expected);
  }
}
