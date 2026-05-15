package com.freightclub.modules.load.application;

import com.freightclub.modules.load.domain.CarrierCandidate;
import com.freightclub.modules.load.domain.MatchCriteria;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class SimpleLocationScorerTest {

  private final SimpleLocationScorer scorer = new SimpleLocationScorer();
  private final String tenantId = "tenant-123";

  @Test
  void awardFullPointsWhenBothEquipmentAndCityMatch() {
    MatchCriteria criteria = new MatchCriteria(tenantId, "FLATBED", "Dallas");
    CarrierCandidate candidate = new CarrierCandidate("carrier-1", "FLATBED", "Dallas");

    int score = scorer.calculateScore(criteria, candidate);

    assertEquals(100, score);
  }

  @Test
  void awardZeroPointsWhenEquipmentDoesNotMatch() {
    MatchCriteria criteria = new MatchCriteria(tenantId, "FLATBED", "Dallas");
    CarrierCandidate candidate = new CarrierCandidate("carrier-1", "TANKER", "Dallas");

    int score = scorer.calculateScore(criteria, candidate);

    assertEquals(0, score);
  }

  @Test
  void awardZeroPointsWhenCityDoesNotMatch() {
    MatchCriteria criteria = new MatchCriteria(tenantId, "FLATBED", "Dallas");
    CarrierCandidate candidate = new CarrierCandidate("carrier-1", "FLATBED", "Houston");

    int score = scorer.calculateScore(criteria, candidate);

    assertEquals(0, score);
  }

  @Test
  void awardZeroPointsWhenNeitherEquipmentNorCityMatch() {
    MatchCriteria criteria = new MatchCriteria(tenantId, "FLATBED", "Dallas");
    CarrierCandidate candidate = new CarrierCandidate("carrier-1", "TANKER", "Houston");

    int score = scorer.calculateScore(criteria, candidate);

    assertEquals(0, score);
  }

  @Test
  void handleEquipmentTypeCaseInsensitively() {
    MatchCriteria criteria = new MatchCriteria(tenantId, "flatbed", "Dallas");
    CarrierCandidate candidate = new CarrierCandidate("carrier-1", "FLATBED", "Dallas");

    int score = scorer.calculateScore(criteria, candidate);

    assertEquals(100, score);
  }

  @Test
  void handleCityNameCaseInsensitively() {
    MatchCriteria criteria = new MatchCriteria(tenantId, "FLATBED", "dallas");
    CarrierCandidate candidate = new CarrierCandidate("carrier-1", "FLATBED", "DALLAS");

    int score = scorer.calculateScore(criteria, candidate);

    assertEquals(100, score);
  }

  @Test
  void handleMixedCaseForBothEquipmentAndCity() {
    MatchCriteria criteria = new MatchCriteria(tenantId, "FLatBeD", "DaLLas");
    CarrierCandidate candidate = new CarrierCandidate("carrier-1", "flatbed", "dallas");

    int score = scorer.calculateScore(criteria, candidate);

    assertEquals(100, score);
  }

  @Test
  void handlePartialEquipmentMatchAsNoMatch() {
    MatchCriteria criteria = new MatchCriteria(tenantId, "FLATBED", "Dallas");
    CarrierCandidate candidate = new CarrierCandidate("carrier-1", "FLAT", "Dallas");

    int score = scorer.calculateScore(criteria, candidate);

    assertEquals(0, score);
  }

  @Test
  void handlePartialCityMatchAsNoMatch() {
    MatchCriteria criteria = new MatchCriteria(tenantId, "FLATBED", "Dallas");
    CarrierCandidate candidate = new CarrierCandidate("carrier-1", "FLATBED", "Dallas-Fort Worth");

    int score = scorer.calculateScore(criteria, candidate);

    assertEquals(0, score);
  }

  @Test
  void handleSpecialCharactersInEquipmentType() {
    MatchCriteria criteria = new MatchCriteria(tenantId, "FLAT-BED", "Dallas");
    CarrierCandidate candidate = new CarrierCandidate("carrier-1", "FLAT-BED", "Dallas");

    int score = scorer.calculateScore(criteria, candidate);

    assertEquals(100, score);
  }

  @Test
  void handleWhitespaceInEquipmentAndCity() {
    MatchCriteria criteria = new MatchCriteria(tenantId, "FLAT BED", "New York");
    CarrierCandidate candidate = new CarrierCandidate("carrier-1", "FLAT BED", "New York");

    int score = scorer.calculateScore(criteria, candidate);

    assertEquals(100, score);
  }
}
