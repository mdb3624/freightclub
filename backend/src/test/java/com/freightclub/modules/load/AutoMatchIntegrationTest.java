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

/**
 * Proves that MatchDiscoveryService:
 * 1. Recommends only carriers in the same tenant as the published load.
 * 2. Ignores carriers in other tenants even when equipment + city match.
 * 3. Produces no recommendations when the load is under-specified.
 *
 * LoadRepositoryPort is mocked to isolate from JpaLoadAdapter's PostgreSQL-specific
 * set_config call, allowing H2 to handle carrier and recommendation persistence.
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AutoMatchIntegrationTest {

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
    @DisplayName("only the carrier in the same tenant is recommended — cross-tenant carrier excluded")
    void onlyTenantACarrierIsRecommended() {
        CarrierProfileEntity tenantACarrier = carrierRepo.save(
                new CarrierProfileEntity("FLATBED", "Chicago", TENANT_A));
        carrierRepo.save(
                new CarrierProfileEntity("FLATBED", "Chicago", TENANT_B));  // same equipment+city, wrong tenant

        LoadPublishedEvent event = new LoadPublishedEvent(
                "load-abc", TENANT_A, "shipper-1", "FLATBED", "Chicago");

        matchDiscoveryService.processLoadPublished(event);

        List<MatchRecommendationEntity> recs = recommendationRepo.findAll();
        assertThat(recs).hasSize(1);
        assertThat(recs.get(0).getTenantId()).isEqualTo(TENANT_A);
        assertThat(recs.get(0).getCarrierId()).isEqualTo(tenantACarrier.getId());
        assertThat(recs.get(0).getLoadId()).isEqualTo("load-abc");
    }

    @Test
    @DisplayName("no recommendations when no carriers match the equipment type")
    void noRecommendation_whenEquipmentMismatch() {
        carrierRepo.save(new CarrierProfileEntity("REEFER", "Chicago", TENANT_A));

        LoadPublishedEvent event = new LoadPublishedEvent(
                "load-xyz", TENANT_A, "shipper-1", "FLATBED", "Chicago");

        matchDiscoveryService.processLoadPublished(event);

        assertThat(recommendationRepo.findAll()).isEmpty();
    }

    @Test
    @DisplayName("no recommendations when no carriers match the service area")
    void noRecommendation_whenCityMismatch() {
        carrierRepo.save(new CarrierProfileEntity("FLATBED", "Dallas", TENANT_A));

        LoadPublishedEvent event = new LoadPublishedEvent(
                "load-xyz", TENANT_A, "shipper-1", "FLATBED", "Chicago");

        matchDiscoveryService.processLoadPublished(event);

        assertThat(recommendationRepo.findAll()).isEmpty();
    }

    @Test
    @DisplayName("no recommendations when load is published without equipmentType or originCity")
    void noRecommendation_whenCriteriaNull() {
        carrierRepo.save(new CarrierProfileEntity("FLATBED", "Chicago", TENANT_A));

        LoadPublishedEvent underSpecified = new LoadPublishedEvent(
                "load-xyz", TENANT_A, "shipper-1", null, null);

        matchDiscoveryService.processLoadPublished(underSpecified);

        assertThat(recommendationRepo.findAll()).isEmpty();
    }

    @Test
    @DisplayName("multiple eligible carriers in the same tenant all receive a recommendation")
    void multipleCarriers_allReceiveRecommendation() {
        carrierRepo.save(new CarrierProfileEntity("FLATBED", "Chicago", TENANT_A));
        carrierRepo.save(new CarrierProfileEntity("FLATBED", "Chicago", TENANT_A));

        LoadPublishedEvent event = new LoadPublishedEvent(
                "load-multi", TENANT_A, "shipper-1", "FLATBED", "Chicago");

        matchDiscoveryService.processLoadPublished(event);

        List<MatchRecommendationEntity> recs = recommendationRepo.findByLoadId("load-multi");
        assertThat(recs).hasSize(2);
        assertThat(recs).allMatch(r -> r.getTenantId().equals(TENANT_A));
    }
}
