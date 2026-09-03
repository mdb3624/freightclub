package com.freightclub.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

// US-885 BR-1/AC-2: an impersonation token's own JWT expiry already ends ACCESS the moment it
// lapses (the next request with it is rejected as an expired token) — this job only closes out
// the bookkeeping (impersonation_sessions row + the required "automatic end" audit entry) for
// sessions nobody explicitly ended, on a short poll rather than real-time. Mirrors
// TenantAdminReconciliationService's existing @Scheduled reconciliation pattern in this codebase.
@Service
public class ImpersonationTimeoutReconciliationService {

    private static final Logger log = LoggerFactory.getLogger(ImpersonationTimeoutReconciliationService.class);

    private final JdbcTemplate superUserReadJdbcTemplate;
    private final AdminAuditLogService adminAuditLogService;

    public ImpersonationTimeoutReconciliationService(@Qualifier("superUserReadJdbcTemplate") JdbcTemplate superUserReadJdbcTemplate,
                                                       AdminAuditLogService adminAuditLogService) {
        this.superUserReadJdbcTemplate = superUserReadJdbcTemplate;
        this.adminAuditLogService = adminAuditLogService;
    }

    @Scheduled(cron = "${app.impersonation.timeout-reconciliation-cron:0 * * * * *}")
    public void closeExpiredSessions() {
        List<ExpiredSession> expired = superUserReadJdbcTemplate.query(
                """
                SELECT id, super_user_id, target_user_id
                FROM freightclub.impersonation_sessions
                WHERE ended_at IS NULL AND expires_at < CURRENT_TIMESTAMP
                """,
                (rs, rowNum) -> new ExpiredSession(
                        rs.getString("id"), rs.getString("super_user_id"), rs.getString("target_user_id")));

        for (ExpiredSession session : expired) {
            try {
                superUserReadJdbcTemplate.update(
                        "UPDATE freightclub.impersonation_sessions SET ended_at = CURRENT_TIMESTAMP, end_reason = 'TIMEOUT' WHERE id = ?",
                        session.id());
                adminAuditLogService.record(session.superUserId(), "IMPERSONATION_ENDED", session.targetUserId(), "Automatic timeout");
            } catch (Exception e) {
                log.error("Impersonation timeout reconciliation failed for session {}: {}", session.id(), e.getMessage(), e);
            }
        }
    }

    private record ExpiredSession(String id, String superUserId, String targetUserId) {}
}
