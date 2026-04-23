package com.freightclub.modules.load.infrastructure.persistence.jpa;

import com.freightclub.domain.EquipmentType;
import com.freightclub.modules.load.application.LoadSearchCriteria;
import com.freightclub.modules.load.application.LoadSummary;
import com.freightclub.modules.load.domain.LoadStatus;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LoadSearchAdapterTest {

    @Mock private SpringDataLoadRepository repo;
    @Mock private EntityManager em;

    @InjectMocks
    private LoadSearchAdapter adapter;

    private static final String TENANT = "tenant-abc";

    @SuppressWarnings("unchecked")
    private Query mockNativeQuery() {
        Query q = mock(Query.class);
        when(em.createNativeQuery(anyString())).thenReturn(q);
        when(q.setParameter(anyString(), any())).thenReturn(q);
        when(q.getSingleResult()).thenReturn(1);
        return q;
    }

    private LoadEntity entity(String id, EquipmentType type) {
        LoadEntity e = new LoadEntity();
        e.setId(id);
        e.setTenantId(TENANT);
        e.setShipperId("shipper-1");
        e.setStatus(LoadStatus.PUBLISHED);
        e.setWeightLbs(BigDecimal.valueOf(1000));
        e.setOriginCity("Dallas");
        e.setEquipmentType(type);
        e.setPayRate(BigDecimal.valueOf(2500));
        return e;
    }

    @Test
    @DisplayName("setTenant is called before repository query")
    @SuppressWarnings("unchecked")
    void setTenant_calledBeforeQuery() {
        mockNativeQuery();
        Pageable pageable = PageRequest.of(0, 20);
        when(repo.findAll(any(Specification.class), eq(pageable)))
                .thenReturn(Page.empty(pageable));

        adapter.findAvailableLoads(TENANT, LoadSearchCriteria.empty(), pageable);

        verify(em).createNativeQuery(contains("set_config"));
        verify(repo).findAll(any(Specification.class), eq(pageable));
        InOrder order = inOrder(em, repo);
        order.verify(em).createNativeQuery(anyString());
        order.verify(repo).findAll(any(Specification.class), eq(pageable));
    }

    @Test
    @DisplayName("Results are mapped to LoadSummary with all fields")
    @SuppressWarnings("unchecked")
    void results_mappedToSummary() {
        mockNativeQuery();
        Pageable pageable = PageRequest.of(0, 20);
        List<LoadEntity> entities = List.of(entity("load-1", EquipmentType.FLATBED));
        when(repo.findAll(any(Specification.class), eq(pageable)))
                .thenReturn(new PageImpl<>(entities, pageable, 1));

        Page<LoadSummary> results = adapter.findAvailableLoads(TENANT,
                new LoadSearchCriteria(null, EquipmentType.FLATBED, null), pageable);

        assertThat(results.getContent()).hasSize(1);
        LoadSummary s = results.getContent().get(0);
        assertThat(s.id()).isEqualTo("load-1");
        assertThat(s.tenantId()).isEqualTo(TENANT);
        assertThat(s.equipmentType()).isEqualTo(EquipmentType.FLATBED);
        assertThat(s.originCity()).isEqualTo("Dallas");
        assertThat(s.payRate()).isNotNull();
        assertThat(s.payRate().amount()).isEqualByComparingTo("2500");
    }

    @Test
    @DisplayName("Empty result set returns empty page")
    @SuppressWarnings("unchecked")
    void noMatches_returnsEmptyPage() {
        mockNativeQuery();
        Pageable pageable = PageRequest.of(0, 20);
        when(repo.findAll(any(Specification.class), eq(pageable)))
                .thenReturn(Page.empty(pageable));

        Page<LoadSummary> results = adapter.findAvailableLoads(TENANT, LoadSearchCriteria.empty(), pageable);

        assertThat(results.getContent()).isEmpty();
        assertThat(results.getTotalElements()).isZero();
    }

    @Test
    @DisplayName("Second page returns correct slice")
    @SuppressWarnings("unchecked")
    void paging_secondPageReturned() {
        mockNativeQuery();
        Pageable pageable = PageRequest.of(1, 1);
        List<LoadEntity> entities = List.of(entity("load-2", EquipmentType.DRY_VAN));
        when(repo.findAll(any(Specification.class), eq(pageable)))
                .thenReturn(new PageImpl<>(entities, pageable, 5));

        Page<LoadSummary> results = adapter.findAvailableLoads(TENANT, LoadSearchCriteria.empty(), pageable);

        assertThat(results.getContent()).hasSize(1);
        assertThat(results.getNumber()).isEqualTo(1);
        assertThat(results.getTotalElements()).isEqualTo(5);
        assertThat(results.getTotalPages()).isEqualTo(5);
    }
}
