package com.freightclub.modules.load.infrastructure.persistence.jpa;

import com.freightclub.modules.load.application.ports.out.MatchRecommendationPort;
import com.freightclub.modules.load.domain.MatchRecommendation;
import org.springframework.stereotype.Component;

@Component
public class JpaMatchRecommendationAdapter implements MatchRecommendationPort {

    private final SpringDataMatchRecommendationRepository repo;

    public JpaMatchRecommendationAdapter(SpringDataMatchRecommendationRepository repo) {
        this.repo = repo;
    }

    @Override
    public void save(MatchRecommendation recommendation) {
        repo.save(new MatchRecommendationEntity(
                recommendation.loadId(),
                recommendation.tenantId(),
                recommendation.carrierId(),
                recommendation.matchScore()
        ));
    }
}
