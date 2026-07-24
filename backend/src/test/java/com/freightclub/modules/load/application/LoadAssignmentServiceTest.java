package com.freightclub.modules.load.application;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.freightclub.domain.Load;
import com.freightclub.modules.load.domain.LoadAssignment;
import com.freightclub.modules.load.infrastructure.LoadAssignmentRepository;
import com.freightclub.repository.LoadRepository;
import com.freightclub.security.TenantContextHolder;
import com.freightclub.service.LoadAssignedToCarrierEvent;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Page;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class LoadAssignmentServiceTest {

  @Mock private LoadAssignmentRepository repository;
  @Mock private LoadRepository loadRepository;
  @Mock private ApplicationEventPublisher eventPublisher;

  private LoadAssignmentService service;

  private static final String TEST_TENANT_ID = "tenant-123";
  private static final String TEST_LOAD_ID = "load-456";
  private static final String TEST_CARRIER_ID = "carrier-789";
  private static final String TEST_SHIPPER_ID = "shipper-101";

  @BeforeEach
  void setup() {
    TenantContextHolder.setTenantId(TEST_TENANT_ID);
    TenantContextHolder.setUserId("test-user-123");
    service = new LoadAssignmentService(repository, loadRepository, eventPublisher);
  }

  private Load buildLoad() {
    Load load = new Load();
    ReflectionTestUtils.setField(load, "id", TEST_LOAD_ID);
    load.setTenantId(TEST_TENANT_ID);
    return load;
  }

  @AfterEach
  void teardown() {
    TenantContextHolder.clear();
  }

  @Test
  void testAssignLoadToCarrier_CreatesNewAssignment() {
    when(repository.findByLoadAndTenant(TEST_LOAD_ID, TEST_TENANT_ID))
        .thenReturn(Optional.empty());
    when(repository.save(any(LoadAssignment.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));
    when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(TEST_LOAD_ID, TEST_TENANT_ID))
        .thenReturn(Optional.of(buildLoad()));

    LoadAssignment result =
        service.assignLoadToCarrier(TEST_LOAD_ID, TEST_CARRIER_ID, TEST_SHIPPER_ID);

    assertNotNull(result);
    assertEquals(TEST_LOAD_ID, result.getLoadId());
    assertEquals(TEST_CARRIER_ID, result.getAssignedCarrierId());
    assertEquals(TEST_SHIPPER_ID, result.getAssignedByShipperId());
    assertNotNull(result.getAssignedAt());
    verify(repository, times(1)).save(any(LoadAssignment.class));
  }

  @Test
  // AC-1: Carrier receives a notification when directly assigned a load (US-861)
  void testAssignLoadToCarrier_PublishesLoadAssignedToCarrierEvent() {
    when(repository.findByLoadAndTenant(TEST_LOAD_ID, TEST_TENANT_ID))
        .thenReturn(Optional.empty());
    when(repository.save(any(LoadAssignment.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));
    Load load = buildLoad();
    when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(TEST_LOAD_ID, TEST_TENANT_ID))
        .thenReturn(Optional.of(load));

    service.assignLoadToCarrier(TEST_LOAD_ID, TEST_CARRIER_ID, TEST_SHIPPER_ID);

    ArgumentCaptor<Object> captor = ArgumentCaptor.forClass(Object.class);
    verify(eventPublisher, times(1)).publishEvent(captor.capture());
    assertInstanceOf(LoadAssignedToCarrierEvent.class, captor.getValue());
    LoadAssignedToCarrierEvent evt = (LoadAssignedToCarrierEvent) captor.getValue();
    assertSame(load, evt.load());
    assertEquals(TEST_CARRIER_ID, evt.carrierId());
  }

  @Test
  // AC-2: Notification only fires after successful commit — no event on the failure path (US-861)
  void testAssignLoadToCarrier_ThrowsIfAlreadyAssigned() {
    LoadAssignment existing = new LoadAssignment(
        "id-1", TEST_LOAD_ID, TEST_TENANT_ID, TEST_CARRIER_ID, TEST_SHIPPER_ID);

    when(repository.findByLoadAndTenant(TEST_LOAD_ID, TEST_TENANT_ID))
        .thenReturn(Optional.of(existing));

    assertThrows(
        IllegalArgumentException.class,
        () -> service.assignLoadToCarrier(TEST_LOAD_ID, TEST_CARRIER_ID, TEST_SHIPPER_ID));
    verify(repository, never()).save(any(LoadAssignment.class));
    verify(eventPublisher, never()).publishEvent(any());
  }

  @Test
  void testReassignLoadToCarrier_UpdatesAssignment() {
    LoadAssignment existing = new LoadAssignment(
        "id-1", TEST_LOAD_ID, TEST_TENANT_ID, "old-carrier-123", TEST_SHIPPER_ID);

    when(repository.findByLoadAndTenant(TEST_LOAD_ID, TEST_TENANT_ID))
        .thenReturn(Optional.of(existing));
    when(repository.save(any(LoadAssignment.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    LoadAssignment result =
        service.reassignLoadToCarrier(TEST_LOAD_ID, TEST_CARRIER_ID, TEST_SHIPPER_ID);

    assertEquals(TEST_CARRIER_ID, result.getAssignedCarrierId());
    assertNotNull(result.getAssignedAt());
    verify(repository, times(1)).save(any(LoadAssignment.class));
  }

  @Test
  void testReassignLoadToCarrier_ThrowsIfNotAssigned() {
    when(repository.findByLoadAndTenant(TEST_LOAD_ID, TEST_TENANT_ID))
        .thenReturn(Optional.empty());

    assertThrows(
        IllegalArgumentException.class,
        () -> service.reassignLoadToCarrier(TEST_LOAD_ID, TEST_CARRIER_ID, TEST_SHIPPER_ID));
    verify(repository, never()).save(any(LoadAssignment.class));
  }

  @Test
  void testRevokeAssignment_SoftDeletes() {
    LoadAssignment existing = new LoadAssignment(
        "id-1", TEST_LOAD_ID, TEST_TENANT_ID, TEST_CARRIER_ID, TEST_SHIPPER_ID);

    when(repository.findByLoadAndTenant(TEST_LOAD_ID, TEST_TENANT_ID))
        .thenReturn(Optional.of(existing));
    when(repository.save(any(LoadAssignment.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    service.revokeAssignment(TEST_LOAD_ID);

    verify(repository, times(1)).save(argThat(la -> la.getDeletedAt() != null));
  }

  @Test
  void testRevokeAssignment_ThrowsIfNotAssigned() {
    when(repository.findByLoadAndTenant(TEST_LOAD_ID, TEST_TENANT_ID))
        .thenReturn(Optional.empty());

    assertThrows(
        IllegalArgumentException.class,
        () -> service.revokeAssignment(TEST_LOAD_ID));
    verify(repository, never()).save(any(LoadAssignment.class));
  }

  @Test
  void testGetAssignedLoads_ReturnsPaginatedList() {
    LoadAssignment assignment = new LoadAssignment(
        "id-1", TEST_LOAD_ID, TEST_TENANT_ID, TEST_CARRIER_ID, TEST_SHIPPER_ID);
    Page<LoadAssignment> page = new PageImpl<>(List.of(assignment));

    when(repository.findByCarrierAndTenant(eq(TEST_CARRIER_ID), eq(TEST_TENANT_ID), any()))
        .thenReturn(page);

    Page<LoadAssignment> result = service.getAssignedLoads(TEST_CARRIER_ID, 0);

    assertNotNull(result);
    assertEquals(1, result.getTotalElements());
    assertEquals(TEST_LOAD_ID, result.getContent().get(0).getLoadId());
  }

  @Test
  void testGetAssignmentByLoad_ReturnsAssignment() {
    LoadAssignment assignment = new LoadAssignment(
        "id-1", TEST_LOAD_ID, TEST_TENANT_ID, TEST_CARRIER_ID, TEST_SHIPPER_ID);

    when(repository.findByLoadAndTenant(TEST_LOAD_ID, TEST_TENANT_ID))
        .thenReturn(Optional.of(assignment));

    Optional<LoadAssignment> result = service.getAssignmentByLoad(TEST_LOAD_ID);

    assertTrue(result.isPresent());
    assertEquals(TEST_CARRIER_ID, result.get().getAssignedCarrierId());
  }

  @Test
  void testAcceptAssignment_SetsAcceptedFlags() {
    LoadAssignment assignment = new LoadAssignment(
        "id-1", TEST_LOAD_ID, TEST_TENANT_ID, TEST_CARRIER_ID, TEST_SHIPPER_ID);
    assignment.setAcceptedByCarrier(null);

    when(repository.findByLoadAndTenant(TEST_LOAD_ID, TEST_TENANT_ID))
        .thenReturn(Optional.of(assignment));
    when(repository.save(any(LoadAssignment.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    service.acceptAssignment(TEST_LOAD_ID, TEST_CARRIER_ID);

    verify(repository, times(1)).save(argThat(
        la -> la.getAcceptedByCarrier() != null && la.getAcceptedAt() != null));
  }

  @Test
  void testAcceptAssignment_ThrowsIfWrongCarrier() {
    LoadAssignment assignment = new LoadAssignment(
        "id-1", TEST_LOAD_ID, TEST_TENANT_ID, "different-carrier", TEST_SHIPPER_ID);

    when(repository.findByLoadAndTenant(TEST_LOAD_ID, TEST_TENANT_ID))
        .thenReturn(Optional.of(assignment));

    assertThrows(
        IllegalArgumentException.class,
        () -> service.acceptAssignment(TEST_LOAD_ID, TEST_CARRIER_ID));
  }

  @Test
  void testMultiTenantIsolation_FiltersCorrectly() {
    String tenantA = "tenant-a";
    String tenantB = "tenant-b";
    LoadAssignment assignmentA = new LoadAssignment(
        "id-a", "load-a", tenantA, "carrier-a", "shipper-a");
    LoadAssignment assignmentB = new LoadAssignment(
        "id-b", "load-b", tenantB, "carrier-b", "shipper-b");

    when(repository.findByLoadAndTenant("load-a", tenantA))
        .thenReturn(Optional.of(assignmentA));
    when(repository.findByLoadAndTenant("load-b", tenantB))
        .thenReturn(Optional.of(assignmentB));

    TenantContextHolder.setTenantId(tenantA);
    Optional<LoadAssignment> resultA = service.getAssignmentByLoad("load-a");

    TenantContextHolder.setTenantId(tenantB);
    Optional<LoadAssignment> resultB = service.getAssignmentByLoad("load-b");

    assertTrue(resultA.isPresent());
    assertTrue(resultB.isPresent());
    assertEquals(tenantA, resultA.get().getTenantId());
    assertEquals(tenantB, resultB.get().getTenantId());
  }
}
