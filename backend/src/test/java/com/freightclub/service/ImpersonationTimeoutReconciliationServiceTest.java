package com.freightclub.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

// US-885 AC-2: a session's JWT already stops granting access the moment it expires — this job
// only closes the bookkeeping (session row + the required audit entry) for anything nobody
// explicitly ended.
@ExtendWith(MockitoExtension.class)
class ImpersonationTimeoutReconciliationServiceTest {

    @Mock private JdbcTemplate superUserReadJdbcTemplate;
    @Mock private AdminAuditLogService adminAuditLogService;

    private ImpersonationTimeoutReconciliationService newService() {
        return new ImpersonationTimeoutReconciliationService(superUserReadJdbcTemplate, adminAuditLogService);
    }

    @Test
    @SuppressWarnings("unchecked")
    void closesExpiredSessions_andAuditsEachOne() {
        when(superUserReadJdbcTemplate.query(anyString(), any(RowMapper.class)))
                .thenAnswer(inv -> {
                    RowMapper<Object> mapper = inv.getArgument(1);
                    java.sql.ResultSet rs = org.mockito.Mockito.mock(java.sql.ResultSet.class);
                    when(rs.getString("id")).thenReturn("session-1");
                    when(rs.getString("super_user_id")).thenReturn("admin-1");
                    when(rs.getString("target_user_id")).thenReturn("target-1");
                    return List.of(mapper.mapRow(rs, 0));
                });

        newService().closeExpiredSessions();

        verify(superUserReadJdbcTemplate).update(contains("end_reason = 'TIMEOUT'"), eq("session-1"));
        verify(adminAuditLogService).record("admin-1", "IMPERSONATION_ENDED", "target-1", "Automatic timeout");
    }

    @Test
    @SuppressWarnings("unchecked")
    void doesNothing_whenNoExpiredSessions() {
        when(superUserReadJdbcTemplate.query(anyString(), any(RowMapper.class))).thenReturn(List.of());

        newService().closeExpiredSessions();

        verifyNoInteractions(adminAuditLogService);
    }
}
