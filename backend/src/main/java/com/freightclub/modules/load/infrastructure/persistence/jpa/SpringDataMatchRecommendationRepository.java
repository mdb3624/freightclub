package com.freightclub.modules.load.infrastructure.persistence.jpa;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SpringDataMatchRecommendationRepository extends JpaRepository<MatchRecommendationEntity, String> {

    List<MatchRecommendationEntity> findByLoadId(String loadId);

    List<MatchRecommendationEntity> findByTenantId(String tenantId);
}
