package com.freightclub.modules.shipper.application;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.freightclub.modules.shipper.domain.ShipperPreferredCarrier;
import com.freightclub.modules.shipper.infrastructure.ShipperPreferredCarrierRepository;
import com.freightclub.security.TenantContextHolder;
import java.time.OffsetDateTime;
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
class ShipperPreferredCarrierServiceTest {

  @Mock private ShipperPreferredCarrierRepository repository;

  private ShipperPreferredCarrierService service;

  private static final String TEST_TENANT_ID = "tenant-123";
  private static final String TEST_SHIPPER_ID = "shipper-456";
  private static final String TEST_CARRIER_ID = "carrier-789";

  @BeforeEach
  void setup() {
    TenantContextHolder.setTenantId(TEST_TENANT_ID);
    TenantContextHolder.setUserId("test-user-123");
    service = new ShipperPreferredCarrierService(repository);
  }

  @AfterEach
  void teardown() {
    TenantContextHolder.clear();
  }

  @Test
  void testAddPreferredCarrier_CreatesNewRecord() {
    when(repository.findByShipperCarrierAndTenant(TEST_TENANT_ID, TEST_SHIPPER_ID, TEST_CARRIER_ID))
        .thenReturn(Optional.empty());
    when(repository.save(any(ShipperPreferredCarrier.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    ShipperPreferredCarrier result =
        service.addPreferredCarrier(TEST_SHIPPER_ID, TEST_CARRIER_ID, "Negotiated rate");

    assertNotNull(result);
    assertEquals(TEST_SHIPPER_ID, result.getShipperId());
    assertEquals(TEST_CARRIER_ID, result.getCarrierId());
    assertEquals("Negotiated rate", result.getNotes());
    verify(repository, times(1)).save(any(ShipperPreferredCarrier.class));
  }

  @Test
  void testAddPreferredCarrier_ThrowsIfAlreadyExists() {
    ShipperPreferredCarrier existing = new ShipperPreferredCarrier(
        "id-1", TEST_SHIPPER_ID, TEST_CARRIER_ID, TEST_TENANT_ID, "notes");

    when(repository.findByShipperCarrierAndTenant(TEST_TENANT_ID, TEST_SHIPPER_ID, TEST_CARRIER_ID))
        .thenReturn(Optional.of(existing));

    assertThrows(
        IllegalArgumentException.class,
        () -> service.addPreferredCarrier(TEST_SHIPPER_ID, TEST_CARRIER_ID, "notes"));
  }

  @Test
  void testGetPreferredCarriers_ReturnsPaginatedList() {
    ShipperPreferredCarrier carrier = new ShipperPreferredCarrier(
        "id-1", TEST_SHIPPER_ID, TEST_CARRIER_ID, TEST_TENANT_ID, "notes");
    Page<ShipperPreferredCarrier> page = new PageImpl<>(List.of(carrier));

    when(repository.findByShipperAndTenant(eq(TEST_TENANT_ID), eq(TEST_SHIPPER_ID), any()))
        .thenReturn(page);

    Page<ShipperPreferredCarrier> result = service.getPreferredCarriers(TEST_SHIPPER_ID, 0);

    assertNotNull(result);
    assertEquals(1, result.getTotalElements());
    assertEquals(TEST_CARRIER_ID, result.getContent().get(0).getCarrierId());
  }

  @Test
  void testRemovePreferredCarrier_SoftDeletes() {
    ShipperPreferredCarrier carrier = new ShipperPreferredCarrier(
        "id-1", TEST_SHIPPER_ID, TEST_CARRIER_ID, TEST_TENANT_ID, "notes");

    when(repository.findByShipperCarrierAndTenant(TEST_TENANT_ID, TEST_SHIPPER_ID, TEST_CARRIER_ID))
        .thenReturn(Optional.of(carrier));
    when(repository.save(any(ShipperPreferredCarrier.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    service.removePreferredCarrier(TEST_SHIPPER_ID, TEST_CARRIER_ID);

    verify(repository, times(1)).save(argThat(c -> c.getDeletedAt() != null));
  }

  @Test
  void testRemovePreferredCarrier_ThrowsIfNotFound() {
    when(repository.findByShipperCarrierAndTenant(TEST_TENANT_ID, TEST_SHIPPER_ID, TEST_CARRIER_ID))
        .thenReturn(Optional.empty());

    assertThrows(
        IllegalArgumentException.class,
        () -> service.removePreferredCarrier(TEST_SHIPPER_ID, TEST_CARRIER_ID));
  }

  @Test
  void testGetPreferredCarrierCount_ReturnsCorrectCount() {
    when(repository.countByShipperAndTenant(TEST_TENANT_ID, TEST_SHIPPER_ID))
        .thenReturn(5L);

    long count = service.getPreferredCarrierCount(TEST_SHIPPER_ID);

    assertEquals(5L, count);
  }

  @Test
  void testMultiTenantIsolation_FiltersCorrectly() {
    String tenantA = "tenant-a";
    String tenantB = "tenant-b";

    when(repository.countByShipperAndTenant(tenantA, TEST_SHIPPER_ID)).thenReturn(3L);
    when(repository.countByShipperAndTenant(tenantB, TEST_SHIPPER_ID)).thenReturn(1L);

    TenantContextHolder.setTenantId(tenantA);
    long countA = service.getPreferredCarrierCount(TEST_SHIPPER_ID);

    TenantContextHolder.setTenantId(tenantB);
    long countB = service.getPreferredCarrierCount(TEST_SHIPPER_ID);

    assertEquals(3L, countA);
    assertEquals(1L, countB);
  }
}
