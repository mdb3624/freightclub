package com.freightclub.modules.recommendation.application;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.freightclub.modules.recommendation.domain.LoadRecommendation;
import com.freightclub.modules.recommendation.domain.MatchReason;
import com.freightclub.modules.recommendation.infrastructure.LoadRecommendationEntity;
import com.freightclub.modules.recommendation.infrastructure.LoadRecommendationRepository;
import com.freightclub.security.TenantContextHolder;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("RecommendationService Tests")
class RecommendationServiceTest {

  @Mock private LoadRecommendationRepository repository;
  private RecommendationService service;

  private String tenantId;
  private String loadId;
  private String truckerId;

  @BeforeEach
  void setUp() {
    tenantId = UUID.randomUUID().toString();
    loadId = UUID.randomUUID().toString();
    truckerId = UUID.randomUUID().toString();
    TenantContextHolder.setTenantId(tenantId);

    service = new RecommendationService(repository);
  }

  @AfterEach
  void tearDown() {
    TenantContextHolder.clear();
  }

  @Test
  @DisplayName("should generate recommendation")
  void testGenerateRecommendation() {
    MatchReason matchReason = new MatchReason(true, true, true, true);
    LoadRecommendation domain = LoadRecommendation.createRecommendation(
        tenantId, loadId, truckerId, 150, matchReason);
    LoadRecommendationEntity entity = LoadRecommendationEntity.fromDomain(domain);

    when(repository.save(any(LoadRecommendationEntity.class))).thenReturn(entity);

    LoadRecommendationDTO result = service.generateRecommendation(
        loadId, truckerId, 150, matchReason);

    assertNotNull(result);
    assertEquals(loadId, result.loadId());
    assertEquals(truckerId, result.truckerId());
    assertEquals(150, result.matchScore());
  }

  @Test
  @DisplayName("should get recommendations for trucker")
  void testGetRecommendationsForTrucker() {
    MatchReason reason = new MatchReason(true, true, false, false);
    LoadRecommendation domain = LoadRecommendation.createRecommendation(
        tenantId, loadId, truckerId, 100, reason);
    LoadRecommendationEntity entity = LoadRecommendationEntity.fromDomain(domain);

    when(repository.findByTenantIdAndTruckerIdAndDeletedAtIsNull(tenantId, truckerId))
        .thenReturn(List.of(entity));

    List<LoadRecommendationDTO> results = service.getRecommendationsForTrucker(truckerId);

    assertEquals(1, results.size());
    assertEquals(100, results.get(0).matchScore());
  }

  @Test
  @DisplayName("should delete recommendation (soft delete)")
  void testDeleteRecommendation() {
    MatchReason reason = new MatchReason(true, true, true, true);
    LoadRecommendation domain = LoadRecommendation.createRecommendation(
        tenantId, loadId, truckerId, 150, reason);
    LoadRecommendationEntity entity = LoadRecommendationEntity.fromDomain(domain);

    when(repository.findByTenantIdAndLoadIdAndTruckerIdAndDeletedAtIsNull(
            tenantId, loadId, truckerId))
        .thenReturn(Optional.of(entity));
    when(repository.save(any(LoadRecommendationEntity.class))).thenReturn(entity);

    service.deleteRecommendation(loadId, truckerId);

    verify(repository).save(any(LoadRecommendationEntity.class));
  }
}
