package com.freightclub.modules.recommendation.application;

import com.freightclub.security.TenantContextHolder;
import com.freightclub.modules.recommendation.domain.LoadRecommendation;
import com.freightclub.modules.recommendation.domain.MatchReason;
import com.freightclub.modules.recommendation.infrastructure.LoadRecommendationEntity;
import com.freightclub.modules.recommendation.infrastructure.LoadRecommendationRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class RecommendationService {
  private final LoadRecommendationRepository repository;

  public RecommendationService(LoadRecommendationRepository repository) {
    this.repository = repository;
  }

  public LoadRecommendationDTO generateRecommendation(
      String loadId,
      String truckerId,
      int matchScore,
      MatchReason matchReason) {
    String tenantId = TenantContextHolder.getTenantId();

    LoadRecommendation domain = LoadRecommendation.createRecommendation(
        tenantId, loadId, truckerId, matchScore, matchReason);

    LoadRecommendationEntity entity = LoadRecommendationEntity.fromDomain(domain);
    LoadRecommendationEntity saved = repository.save(entity);

    return toDTO(saved.toDomain());
  }

  public List<LoadRecommendationDTO> getRecommendationsForTrucker(String truckerId) {
    String tenantId = TenantContextHolder.getTenantId();
    return repository
        .findByTenantIdAndTruckerIdAndDeletedAtIsNull(tenantId, truckerId)
        .stream()
        .map(entity -> toDTO(entity.toDomain()))
        .toList();
  }

  public List<LoadRecommendationDTO> getRecommendationsForLoad(String loadId) {
    String tenantId = TenantContextHolder.getTenantId();
    return repository
        .findByTenantIdAndLoadIdAndDeletedAtIsNull(tenantId, loadId)
        .stream()
        .map(entity -> toDTO(entity.toDomain()))
        .toList();
  }

  public List<LoadRecommendationDTO> getTopRecommendationsForLoad(String loadId, int limit) {
    String tenantId = TenantContextHolder.getTenantId();
    return repository
        .findTopRecommendationsForLoad(tenantId, loadId, limit)
        .stream()
        .map(entity -> toDTO(entity.toDomain()))
        .toList();
  }

  public void deleteRecommendation(String loadId, String truckerId) {
    String tenantId = TenantContextHolder.getTenantId();
    repository
        .findByTenantIdAndLoadIdAndTruckerIdAndDeletedAtIsNull(tenantId, loadId, truckerId)
        .ifPresent(entity -> {
          LoadRecommendation domain = entity.toDomain();
          domain.softDelete();
          repository.save(LoadRecommendationEntity.fromDomain(domain));
        });
  }

  private LoadRecommendationDTO toDTO(LoadRecommendation domain) {
    return new LoadRecommendationDTO(
        domain.getId(),
        domain.getTenantId(),
        domain.getLoadId(),
        domain.getTruckerId(),
        domain.getMatchScore(),
        domain.getMatchReason(),
        domain.getCreatedAt());
  }
}
