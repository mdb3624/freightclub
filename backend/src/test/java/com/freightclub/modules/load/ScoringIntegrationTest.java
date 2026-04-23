package com.freightclub.modules.load;

import com.freightclub.modules.load.application.MatchDiscoveryService;
import com.freightclub.modules.load.application.ports.out.LoadRepositoryPort;
import com.freightclub.modules.load.domain.LoadPublishedEvent;
import com.freightclub.modules.load.infrastructure.persistence.jpa.CarrierProfileEntity;
import com.freightclub.modules.load.infrastructure.persistence.jpa.MatchRecommendationEntity;
import com.freightclub.modules.load.infrastructure.persistence.jpa.SpringDataCarrierProfileRepository;
import com.freightclub.modules.load.infrastructure.persistence.jpa.SpringDataMatchRecommendationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ScoringIntegrationTest {

    private static final String TENANT_A = UUID.randomUUID().toString();
    private static final String TENANT_B = UUID.randomUUID().toString();

    @Autowired MatchDiscoveryService matchDiscoveryService;
    @Autowired SpringDataCarrierProfileRepository carrierRepo;
    @Autowired SpringDataMatchRecommendationRepository recommendationRepo;

    @MockBean LoadRepositoryPort loadRepositoryPort;

    @BeforeEach
    void setUp() {
        recommendationRepo.deleteAll();
        carrierRepo.deleteAll();
    }

    @Test
    @DisplayName("matching carrier receives score=100; non-matching carrier receives no recommendation")
    void scorer_producesCorrectScores() {
        CarrierProfileEntity matching = carrierRepo.save(
                new CarrierProfileEntity("FLATBED", "Chicago", TENANT_A));
        carrierRepo.save(
                new CarrierProfileEntity("REEFER", "Dallas", TENANT_A));

        matchDiscoveryService.processLoadPublished(
                new LoadPublishedEvent("load-1", TENANT_A, "shipper-1", "FLATBED", "Chicago"));

        List<MatchRecommendationEntity> recs = recommendationRepo.findAll();
        assertThat(recs).hasSize(1);
        assertThat(recs.get(0).getCarrierId()).isEqualTo(matching.getId());
        assertThat(recs.get(0).getMatchScore()).isEqualTo(100);
    }

    @Test
    @DisplayName("tenant isolation: TENANT_B carrier never appears in TENANT_A recommendations")
    void tenantIsolation_isAbsolute() {
        carrierRepo.save(new CarrierProfileEntity("FLATBED", "Chicago", TENANT_A));
        carrierRepo.save(new CarrierProfileEntity("FLATBED", "Chicago", TENANT_B));

        matchDiscoveryService.processLoadPublished(
                new LoadPublishedEvent("load-2", TENANT_A, "shipper-1", "FLATBED", "Chicago"));

        List<MatchRecommendationEntity> recs = recommendationRepo.findAll();
        assertThat(recs).hasSize(1);
        assertThat(recs.get(0).getTenantId()).isEqualTo(TENANT_A);
    }
}
