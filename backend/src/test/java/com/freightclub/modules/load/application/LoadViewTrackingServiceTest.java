package com.freightclub.modules.load.application;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.freightclub.modules.load.domain.LoadView;
import com.freightclub.modules.load.infrastructure.LoadViewRepository;
import com.freightclub.security.TenantContextHolder;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class LoadViewTrackingServiceTest {

  @Mock private LoadViewRepository repository;

  private LoadViewTrackingService service;

  private static final String TEST_TENANT_ID = "tenant-123";
  private static final String TEST_LOAD_ID = "load-456";
  private static final String TEST_CARRIER_ID = "carrier-789";

  @BeforeEach
  void setup() {
    TenantContextHolder.setTenantId(TEST_TENANT_ID);
    TenantContextHolder.setUserId("test-user-123");
    service = new LoadViewTrackingService(repository);
  }

  @AfterEach
  void teardown() {
    TenantContextHolder.clear();
  }

  @Test
  void testRecordLoadView_SavesView() {
    when(repository.save(any(LoadView.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    service.recordLoadView(TEST_LOAD_ID, TEST_CARRIER_ID);

    verify(repository, times(1)).save(any(LoadView.class));
  }

  @Test
  void testGetLoadViewCount_ReturnsCount() {
    when(repository.countByLoadAndTenant(TEST_LOAD_ID, TEST_TENANT_ID))
        .thenReturn(5L);

    long count = service.getLoadViewCount(TEST_LOAD_ID);

    assertEquals(5L, count);
  }

  @Test
  void testGetLoadInterest_ReturnsUniqueCarrierCount() {
    when(repository.countUniqueCarriersViewedLoad(TEST_LOAD_ID, TEST_TENANT_ID))
        .thenReturn(3L);

    long interest = service.getLoadInterest(TEST_LOAD_ID);

    assertEquals(3L, interest);
  }

  @Test
  void testRecordLoadView_CreatesLoadViewWithCorrectFields() {
    when(repository.save(any(LoadView.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    service.recordLoadView(TEST_LOAD_ID, TEST_CARRIER_ID);

    verify(repository, times(1)).save(argThat(view ->
        view.getLoadId().equals(TEST_LOAD_ID)
        && view.getCarrierId().equals(TEST_CARRIER_ID)
        && view.getViewedAt() != null));
  }
}
