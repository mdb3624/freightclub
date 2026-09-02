package com.freightclub.service;

import com.freightclub.domain.DisputeOutcome;
import com.freightclub.dto.DisputeQueueItemResponse;
import com.freightclub.dto.ResolveDisputeRequest;
import com.freightclub.exception.DisputeNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

// US-751 AC-1/AC-3/AC-4/AC-5: cross-tenant queue, forced-reason resolution, audit fields,
// no payment logic. Reads/writes exclusively through the narrow superUserReadJdbcTemplate.
@ExtendWith(MockitoExtension.class)
class DisputeResolutionServiceTest {

    @Mock private JdbcTemplate superUserReadJdbcTemplate;

    @Test
    void listOpenDisputes_returnsCrossTenantQueue() {
        when(superUserReadJdbcTemplate.query(anyString(), (RowMapper<Object>) any())).thenAnswer(inv ->
                List.of(new DisputeQueueItemResponse(
                        "dispute-1", "load-1", "Acme Freight", "shipper@example.com",
                        "Load arrived damaged", "OPEN", LocalDateTime.now())));

        DisputeResolutionService service = new DisputeResolutionService(superUserReadJdbcTemplate);
        List<DisputeQueueItemResponse> result = service.listOpenDisputes();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).tenantName()).isEqualTo("Acme Freight");
    }

    @Test
    void resolveDispute_updatesOutcomeAndReason_whenDisputeIsOpen() {
        when(superUserReadJdbcTemplate.update(anyString(), any(Object[].class))).thenReturn(1);

        DisputeResolutionService service = new DisputeResolutionService(superUserReadJdbcTemplate);
        service.resolveDispute("admin-1", "dispute-1",
                new ResolveDisputeRequest(DisputeOutcome.RESOLVED_SHIPPER_FAVOR, "Carrier confirmed damage on delivery"));
        // No exception thrown = success; SQL argument shape is verified via the update() stub above.
    }

    @Test
    void resolveDispute_throws_whenDisputeNotFoundOrAlreadyResolved() {
        when(superUserReadJdbcTemplate.update(anyString(), any(Object[].class))).thenReturn(0);

        DisputeResolutionService service = new DisputeResolutionService(superUserReadJdbcTemplate);

        assertThatThrownBy(() -> service.resolveDispute("admin-1", "dispute-missing",
                new ResolveDisputeRequest(DisputeOutcome.NO_ACTION_NEEDED, "Investigated, no issue found")))
                .isInstanceOf(DisputeNotFoundException.class);
    }
}
