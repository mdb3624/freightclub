package com.freightclub.modules.shipper.application;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.freightclub.modules.shipper.domain.BlockedCarrier;
import com.freightclub.modules.shipper.infrastructure.BlockedCarrierRepository;
import com.freightclub.security.TenantContextHolder;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Page;

@ExtendWith(MockitoExtension.class)
class BlockedCarrierServiceTest {

  @Mock private BlockedCarrierRepository repository;

  private BlockedCarrierService service;

  private static final String TEST_TENANT_ID = "tenant-123";
  private static final String TEST_SHIPPER_ID = "shipper-456";
  private static final String TEST_CARRIER_ID = "carrier-789";

  @BeforeEach
  void setup() {
    TenantContextHolder.setTenantId(TEST_TENANT_ID);
    TenantContextHolder.setUserId("test-user-123");
    service = new BlockedCarrierService(repository);
  }

  @AfterEach
  void teardown() {
    TenantContextHolder.clear();
  }

  @Test
  void testBlockCarrier_CreatesNewBlock() {
    when(repository.findByShipperCarrierAndTenant(TEST_SHIPPER_ID, TEST_CARRIER_ID, TEST_TENANT_ID))
        .thenReturn(Optional.empty());
    when(repository.save(any(BlockedCarrier.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    BlockedCarrier result = service.blockCarrier(TEST_SHIPPER_ID, TEST_CARRIER_ID, "Poor performance");

    assertNotNull(result);
    assertEquals(TEST_SHIPPER_ID, result.getShipperId());
    assertEquals(TEST_CARRIER_ID, result.getCarrierId());
    assertEquals("Poor performance", result.getReason());
    verify(repository, times(1)).save(any(BlockedCarrier.class));
  }

  @Test
  void testBlockCarrier_ThrowsIfAlreadyBlocked() {
    BlockedCarrier existing = new BlockedCarrier(
        "id-1", TEST_SHIPPER_ID, TEST_CARRIER_ID, TEST_TENANT_ID, "Previous reason");

    when(repository.findByShipperCarrierAndTenant(TEST_SHIPPER_ID, TEST_CARRIER_ID, TEST_TENANT_ID))
        .thenReturn(Optional.of(existing));

    assertThrows(
        IllegalArgumentException.class,
        () -> service.blockCarrier(TEST_SHIPPER_ID, TEST_CARRIER_ID, "New reason"));
    verify(repository, never()).save(any(BlockedCarrier.class));
  }

  @Test
  void testUnblockCarrier_SoftDeletes() {
    BlockedCarrier existing = new BlockedCarrier(
        "id-1", TEST_SHIPPER_ID, TEST_CARRIER_ID, TEST_TENANT_ID, "Reason");

    when(repository.findByShipperCarrierAndTenant(TEST_SHIPPER_ID, TEST_CARRIER_ID, TEST_TENANT_ID))
        .thenReturn(Optional.of(existing));
    when(repository.save(any(BlockedCarrier.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    service.unblockCarrier(TEST_SHIPPER_ID, TEST_CARRIER_ID);

    verify(repository, times(1)).save(argThat(bc -> bc.getDeletedAt() != null));
  }

  @Test
  void testUnblockCarrier_ThrowsIfNotBlocked() {
    when(repository.findByShipperCarrierAndTenant(TEST_SHIPPER_ID, TEST_CARRIER_ID, TEST_TENANT_ID))
        .thenReturn(Optional.empty());

    assertThrows(
        IllegalArgumentException.class,
        () -> service.unblockCarrier(TEST_SHIPPER_ID, TEST_CARRIER_ID));
    verify(repository, never()).save(any(BlockedCarrier.class));
  }

  @Test
  void testGetBlockedCarriers_ReturnsPaginatedList() {
    BlockedCarrier blocked = new BlockedCarrier(
        "id-1", TEST_SHIPPER_ID, TEST_CARRIER_ID, TEST_TENANT_ID, "reason");
    Page<BlockedCarrier> page = new PageImpl<>(List.of(blocked));

    when(repository.findByShipperAndTenant(eq(TEST_SHIPPER_ID), eq(TEST_TENANT_ID), any()))
        .thenReturn(page);

    Page<BlockedCarrier> result = service.getBlockedCarriers(TEST_SHIPPER_ID, 0);

    assertNotNull(result);
    assertEquals(1, result.getTotalElements());
    assertEquals(TEST_CARRIER_ID, result.getContent().get(0).getCarrierId());
  }

  @Test
  void testGetBlockedCarrierCount_ReturnsCorrectCount() {
    when(repository.countByShipperAndTenant(TEST_SHIPPER_ID, TEST_TENANT_ID))
        .thenReturn(3L);

    long count = service.getBlockedCarrierCount(TEST_SHIPPER_ID);

    assertEquals(3L, count);
  }

  @Test
  void testIsCarrierBlocked_ReturnsTrueWhenBlocked() {
    when(repository.isCarrierBlocked(TEST_SHIPPER_ID, TEST_CARRIER_ID, TEST_TENANT_ID))
        .thenReturn(true);

    boolean result = service.isCarrierBlocked(TEST_SHIPPER_ID, TEST_CARRIER_ID);

    assertTrue(result);
  }

  @Test
  void testIsCarrierBlocked_ReturnsFalseWhenNotBlocked() {
    when(repository.isCarrierBlocked(TEST_SHIPPER_ID, TEST_CARRIER_ID, TEST_TENANT_ID))
        .thenReturn(false);

    boolean result = service.isCarrierBlocked(TEST_SHIPPER_ID, TEST_CARRIER_ID);

    assertFalse(result);
  }
}
