package com.freightclub.service;

import com.freightclub.dto.AuditLogEntryResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

// US-880: append-only audit log — the DB grant itself (SELECT, INSERT only, no UPDATE/DELETE)
// is the real enforcement (see V20260902_1100), this test covers the application-level
// contract: mandatory reason (fail-fast, same pattern as US-751's forced-reason resolve), and
// that record() is safe to call inside a caller's own transaction (no @Transactional of its
// own — see class doc comment).
@ExtendWith(MockitoExtension.class)
class AdminAuditLogServiceTest {

    @Mock private JdbcTemplate superUserReadJdbcTemplate;

    @Test
    void record_insertsAuditEntry() {
        AdminAuditLogService service = new AdminAuditLogService(superUserReadJdbcTemplate);

        service.record("actor-1", "USER_SUSPENDED", "target-1", "Reported for fraud");

        verify(superUserReadJdbcTemplate).update(
                anyString(), anyString(), eq("actor-1"), eq("USER_SUSPENDED"), eq("target-1"), eq("Reported for fraud"));
    }

    @Test
    void record_rejectsBlankReason() {
        AdminAuditLogService service = new AdminAuditLogService(superUserReadJdbcTemplate);

        assertThatThrownBy(() -> service.record("actor-1", "USER_SUSPENDED", "target-1", "   "))
                .isInstanceOf(IllegalArgumentException.class);
        verifyNoInteractions(superUserReadJdbcTemplate);
    }

    @Test
    void record_rejectsNullReason() {
        AdminAuditLogService service = new AdminAuditLogService(superUserReadJdbcTemplate);

        assertThatThrownBy(() -> service.record("actor-1", "USER_SUSPENDED", "target-1", null))
                .isInstanceOf(IllegalArgumentException.class);
        verifyNoInteractions(superUserReadJdbcTemplate);
    }

    @Test
    void list_withTargetId_filtersByTarget() {
        AdminAuditLogService service = new AdminAuditLogService(superUserReadJdbcTemplate);
        when(superUserReadJdbcTemplate.query(anyString(), any(RowMapper.class), eq("target-1")))
                .thenReturn(List.of(new AuditLogEntryResponse("id-1", "actor-1", "USER_SUSPENDED", "target-1", "reason", null)));

        List<AuditLogEntryResponse> result = service.list("target-1");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).targetId()).isEqualTo("target-1");
    }

    @Test
    void list_withoutTargetId_returnsAll() {
        AdminAuditLogService service = new AdminAuditLogService(superUserReadJdbcTemplate);
        when(superUserReadJdbcTemplate.query(anyString(), any(RowMapper.class)))
                .thenReturn(List.of(
                        new AuditLogEntryResponse("id-1", "actor-1", "USER_SUSPENDED", "target-1", "reason", null),
                        new AuditLogEntryResponse("id-2", "actor-1", "TENANT_SUSPENDED", "target-2", "reason2", null)));

        List<AuditLogEntryResponse> result = service.list(null);

        assertThat(result).hasSize(2);
    }
}
