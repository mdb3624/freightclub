package com.freightclub.service;

import com.freightclub.dto.SuperUserDashboardResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

// US-750 AC-1/AC-4: reads exclusively through the narrow superUserReadJdbcTemplate, never the
// tenant-scoped JPA repositories — this is the platform's one legitimate cross-tenant view.
@ExtendWith(MockitoExtension.class)
class SuperUserDashboardServiceTest {

    @Mock private JdbcTemplate superUserReadJdbcTemplate;

    @Test
    void returnsTenantCountUserCountsLoadCountsAndTenantList() {
        when(superUserReadJdbcTemplate.queryForObject(anyString(), (Class<Long>) any())).thenReturn(2L);
        when(superUserReadJdbcTemplate.queryForList("SELECT role AS k, COUNT(*) AS cnt FROM freightclub.users WHERE deleted_at IS NULL GROUP BY role"))
                .thenReturn(List.of(Map.of("k", "SHIPPER", "cnt", 5L), Map.of("k", "TRUCKER", "cnt", 3L)));
        when(superUserReadJdbcTemplate.queryForList("SELECT status AS k, COUNT(*) AS cnt FROM freightclub.loads WHERE deleted_at IS NULL GROUP BY status"))
                .thenReturn(List.of(Map.of("k", "OPEN", "cnt", 4L)));
        when(superUserReadJdbcTemplate.query(anyString(), (RowMapper<Object>) any())).thenAnswer(inv ->
                List.of(new SuperUserDashboardResponse.TenantSummary("tenant-1", "Acme Freight", "FREE", 5L)));

        SuperUserDashboardService service = new SuperUserDashboardService(superUserReadJdbcTemplate);
        SuperUserDashboardResponse result = service.getDashboard();

        assertThat(result.tenantCount()).isEqualTo(2L);
        assertThat(result.userCountByRole()).containsEntry("SHIPPER", 5L).containsEntry("TRUCKER", 3L);
        assertThat(result.loadCountByStatus()).containsEntry("OPEN", 4L);
        assertThat(result.tenants()).hasSize(1);
        assertThat(result.tenants().get(0).name()).isEqualTo("Acme Freight");
        assertThat(result.tenants().get(0).memberCount()).isEqualTo(5L);
    }
}
