package com.freightclub.modules.shipper;

import static org.assertj.core.api.Assertions.*;

import com.freightclub.modules.shipper.domain.ShipperReputation;
import com.freightclub.modules.shipper.infrastructure.ShipperReputationEntity;
import com.freightclub.modules.shipper.infrastructure.ShipperReputationRepository;
import com.freightclub.security.TenantContextHolder;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cache.CacheManager;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ShipperReputationIntegrationTest {

  private static final String TENANT_ID = "test-tenant-123";
  private static final String SHIPPER_ID = "shipper-456";

  @Autowired private ShipperReputationRepository repository;
  @Autowired private CacheManager cacheManager;

  @BeforeEach
  void setup() {
    TenantContextHolder.setTenantId(TENANT_ID);
    cacheManager.getCache("shipperReputation").clear();
  }

  @AfterEach
  void cleanup() {
    TenantContextHolder.clear();
    cacheManager.getCache("shipperReputation").clear();
  }

  @Test
  void testCreateShipperReputation_NewShipperNoPaymentHistory() {
    ShipperReputation rep = ShipperReputation.createNew(TENANT_ID, SHIPPER_ID, null, 0, 0, 0);
    ShipperReputationEntity entity = ShipperReputationEntity.fromDomain(rep);
    entity = repository.save(entity);

    assertThat(entity.getId()).isNotNull();
    assertThat(entity.getTenantId()).isEqualTo(TENANT_ID);
    assertThat(entity.getShipperId()).isEqualTo(SHIPPER_ID);
    assertThat(entity.getCompletedLoadCount()).isEqualTo(0);
    assertThat(entity.isNewShipper()).isTrue();
    assertThat(entity.getPaymentSpeedLabel()).isEqualTo("New shipper — no rating yet");
  }

  @Test
  void testFindActiveReputation_RespectsSoftDelete() {
    ShipperReputation rep = ShipperReputation.createNew(TENANT_ID, SHIPPER_ID, null, 5, 1, 0);
    ShipperReputationEntity entity = ShipperReputationEntity.fromDomain(rep);
    repository.save(entity);

    // Verify found when active
    ShipperReputationEntity found =
        repository.findActiveReputation(TENANT_ID, SHIPPER_ID);
    assertThat(found).isNotNull();
    assertThat(found.getId()).isEqualTo(entity.getId());

    // Soft delete
    entity.setDeletedAt(OffsetDateTime.now(ZoneOffset.UTC));
    repository.save(entity);

    // Verify not found when soft-deleted
    ShipperReputationEntity notFound =
        repository.findActiveReputation(TENANT_ID, SHIPPER_ID);
    assertThat(notFound).isNull();
  }

  @Test
  void testPaymentSpeedCalculation_FastPayer() {
    BigDecimal avgSpeedDays = new BigDecimal("7");
    ShipperReputation rep =
        ShipperReputation.createNew(TENANT_ID, SHIPPER_ID, avgSpeedDays, 25, 1, 0);
    ShipperReputationEntity entity = ShipperReputationEntity.fromDomain(rep);
    entity = repository.save(entity);

    assertThat(entity.getPaymentSpeedLabel()).isEqualTo("Typically pays in 7 days");
  }

  @Test
  void testPaymentSpeedCalculation_SlowPayer() {
    BigDecimal avgSpeedDays = new BigDecimal("30");
    ShipperReputation rep =
        ShipperReputation.createNew(TENANT_ID, SHIPPER_ID, avgSpeedDays, 50, 2, 1);
    ShipperReputationEntity entity = ShipperReputationEntity.fromDomain(rep);
    entity = repository.save(entity);

    assertThat(entity.getPaymentSpeedLabel()).isEqualTo("Typically pays in 30 days");
  }

  @Test
  void testHighRiskFlags_TooManyCancellations() {
    ShipperReputation rep =
        ShipperReputation.createNew(TENANT_ID, SHIPPER_ID, new BigDecimal("14"), 100, 3, 0);
    ShipperReputationEntity entity = ShipperReputationEntity.fromDomain(rep);
    entity = repository.save(entity);

    assertThat(entity.hasHighRiskFlags()).isTrue();
  }

  @Test
  void testHighRiskFlags_TooManyDisputes() {
    ShipperReputation rep =
        ShipperReputation.createNew(TENANT_ID, SHIPPER_ID, new BigDecimal("10"), 80, 1, 3);
    ShipperReputationEntity entity = ShipperReputationEntity.fromDomain(rep);
    entity = repository.save(entity);

    assertThat(entity.hasHighRiskFlags()).isTrue();
  }

  @Test
  void testHighRiskFlags_LowRiskProfile() {
    ShipperReputation rep =
        ShipperReputation.createNew(TENANT_ID, SHIPPER_ID, new BigDecimal("5"), 200, 0, 0);
    ShipperReputationEntity entity = ShipperReputationEntity.fromDomain(rep);
    entity = repository.save(entity);

    assertThat(entity.hasHighRiskFlags()).isFalse();
  }

  @Test
  void testUpdateMetrics_RecalculatedOnPayment() {
    ShipperReputation rep =
        ShipperReputation.createNew(TENANT_ID, SHIPPER_ID, new BigDecimal("14"), 5, 0, 0);
    ShipperReputationEntity entity = ShipperReputationEntity.fromDomain(rep);
    entity = repository.save(entity);

    OffsetDateTime beforeUpdate = entity.getUpdatedAt();

    // Simulate payment confirmed: avg speed improves
    rep.updateMetrics(new BigDecimal("7"), 6, 0, 0);
    entity = ShipperReputationEntity.fromDomain(rep);
    entity = repository.save(entity);

    assertThat(entity.getAveragePaymentSpeedDays()).isEqualTo(new BigDecimal("7"));
    assertThat(entity.getCompletedLoadCount()).isEqualTo(6);
    assertThat(entity.getUpdatedAt()).isAfter(beforeUpdate);
  }

  @Test
  void testTenantIsolation_SeparateShippersPerTenant() {
    String tenant1 = "tenant-1";
    String tenant2 = "tenant-2";

    TenantContextHolder.setTenantId(tenant1);
    ShipperReputation rep1 =
        ShipperReputation.createNew(tenant1, SHIPPER_ID, new BigDecimal("5"), 50, 0, 0);
    ShipperReputationEntity entity1 = ShipperReputationEntity.fromDomain(rep1);
    entity1 = repository.save(entity1);

    TenantContextHolder.setTenantId(tenant2);
    ShipperReputation rep2 =
        ShipperReputation.createNew(tenant2, SHIPPER_ID, new BigDecimal("10"), 100, 1, 0);
    ShipperReputationEntity entity2 = ShipperReputationEntity.fromDomain(rep2);
    entity2 = repository.save(entity2);

    // Verify tenant1 sees only its shipper
    TenantContextHolder.setTenantId(tenant1);
    ShipperReputationEntity found1 =
        repository.findByTenantIdAndShipperIdAndDeletedAtIsNull(tenant1, SHIPPER_ID);
    assertThat(found1).isNotNull();
    assertThat(found1.getAveragePaymentSpeedDays()).isEqualTo(new BigDecimal("5"));

    // Verify tenant2 sees only its shipper
    TenantContextHolder.setTenantId(tenant2);
    ShipperReputationEntity found2 =
        repository.findByTenantIdAndShipperIdAndDeletedAtIsNull(tenant2, SHIPPER_ID);
    assertThat(found2).isNotNull();
    assertThat(found2.getAveragePaymentSpeedDays()).isEqualTo(new BigDecimal("10"));
  }
}
