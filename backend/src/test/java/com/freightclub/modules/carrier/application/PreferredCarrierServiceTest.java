package com.freightclub.modules.carrier.application;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.freightclub.modules.carrier.domain.BlockedCarrier;
import com.freightclub.modules.carrier.domain.PreferredCarrier;
import com.freightclub.modules.carrier.infrastructure.BlockedCarrierEntity;
import com.freightclub.modules.carrier.infrastructure.BlockedCarrierRepository;
import com.freightclub.modules.carrier.infrastructure.PreferredCarrierEntity;
import com.freightclub.modules.carrier.infrastructure.PreferredCarrierRepository;
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
@DisplayName("PreferredCarrierService Tests")
class PreferredCarrierServiceTest {

  @Mock private PreferredCarrierRepository preferredRepository;
  @Mock private BlockedCarrierRepository blockedRepository;
  private PreferredCarrierService service;

  private String tenantId;
  private String shipperId;
  private String truckerId;

  @BeforeEach
  void setUp() {
    tenantId = UUID.randomUUID().toString();
    shipperId = UUID.randomUUID().toString();
    truckerId = UUID.randomUUID().toString();
    TenantContextHolder.setTenantId(tenantId);

    service = new PreferredCarrierService(preferredRepository, blockedRepository);
  }

  @AfterEach
  void tearDown() {
    TenantContextHolder.clear();
  }

  @Test
  @DisplayName("should add preferred carrier")
  void testAddPreferred() {
    PreferredCarrier domain = PreferredCarrier.createPreferred(tenantId, shipperId, truckerId);
    PreferredCarrierEntity entity = PreferredCarrierEntity.fromDomain(domain);

    when(preferredRepository.save(any(PreferredCarrierEntity.class))).thenReturn(entity);

    PreferredCarrierDTO result = service.addPreferred(shipperId, truckerId);

    assertNotNull(result);
    assertEquals(shipperId, result.shipperId());
    assertEquals(truckerId, result.truckerId());
  }

  @Test
  @DisplayName("should get preferred carriers list")
  void testGetPreferredCarriers() {
    PreferredCarrier domain = PreferredCarrier.createPreferred(tenantId, shipperId, truckerId);
    PreferredCarrierEntity entity = PreferredCarrierEntity.fromDomain(domain);

    when(preferredRepository.findByTenantIdAndShipperIdAndDeletedAtIsNull(tenantId, shipperId))
        .thenReturn(List.of(entity));

    List<PreferredCarrierDTO> results = service.getPreferredCarriers(shipperId);

    assertEquals(1, results.size());
    assertEquals(truckerId, results.get(0).truckerId());
  }

  @Test
  @DisplayName("should block carrier")
  void testBlockCarrier() {
    BlockedCarrier domain = BlockedCarrier.blockCarrier(tenantId, shipperId, truckerId);
    BlockedCarrierEntity entity = BlockedCarrierEntity.fromDomain(domain);

    when(blockedRepository.save(any(BlockedCarrierEntity.class))).thenReturn(entity);

    BlockedCarrierDTO result = service.blockCarrier(shipperId, truckerId);

    assertNotNull(result);
    assertEquals(shipperId, result.shipperId());
    assertEquals(truckerId, result.truckerId());
  }

  @Test
  @DisplayName("should check if carrier is blocked")
  void testIsCarrierBlocked() {
    when(blockedRepository.isBlocked(tenantId, shipperId, truckerId)).thenReturn(true);

    boolean result = service.isCarrierBlocked(shipperId, truckerId);

    assertTrue(result);
  }

  @Test
  @DisplayName("should check if carrier is preferred")
  void testIsPreferred() {
    when(preferredRepository.isPreferred(tenantId, shipperId, truckerId)).thenReturn(true);

    boolean result = service.isPreferred(shipperId, truckerId);

    assertTrue(result);
  }
}
