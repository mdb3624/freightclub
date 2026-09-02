package com.freightclub.service;

import com.freightclub.dto.AuditLogEntryResponse;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

// US-880 (Audit Log Foundation): append-only record of every Super User write action. The real
// enforcement is the DB grant (V20260902_1100 — SELECT, INSERT only, no UPDATE/DELETE granted
// to any role), not application code; this service exists to give calling stories (US-881,
// US-884, US-886, ...) one place to write a compliant entry.
//
// record() is deliberately NOT @Transactional — it must run inside the CALLER's own
// @Transactional("superUserTransactionManager") method (see LoginLookupDataSourceConfig), so
// the governed action itself and its audit entry share one transaction and succeed or fail
// together (US-880 BR-1). Wrapping it in its own transaction here would defeat that.
@Service
public class AdminAuditLogService {

    private final JdbcTemplate superUserReadJdbcTemplate;

    public AdminAuditLogService(@Qualifier("superUserReadJdbcTemplate") JdbcTemplate superUserReadJdbcTemplate) {
        this.superUserReadJdbcTemplate = superUserReadJdbcTemplate;
    }

    public void record(String actorUserId, String actionType, String targetId, String reason) {
        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("Audit log reason must not be blank");
        }
        superUserReadJdbcTemplate.update(
                "INSERT INTO freightclub.admin_audit_log (id, actor_user_id, action_type, target_id, reason) VALUES (?, ?, ?, ?, ?)",
                UUID.randomUUID().toString(), actorUserId, actionType, targetId, reason);
    }

    public List<AuditLogEntryResponse> list(String targetId) {
        if (targetId != null) {
            return superUserReadJdbcTemplate.query(
                    """
                    SELECT id, actor_user_id, action_type, target_id, reason, created_at
                    FROM freightclub.admin_audit_log
                    WHERE target_id = ?
                    ORDER BY created_at DESC
                    """,
                    AdminAuditLogService::mapRow, targetId);
        }
        return superUserReadJdbcTemplate.query(
                """
                SELECT id, actor_user_id, action_type, target_id, reason, created_at
                FROM freightclub.admin_audit_log
                ORDER BY created_at DESC
                """,
                AdminAuditLogService::mapRow);
    }

    private static AuditLogEntryResponse mapRow(java.sql.ResultSet rs, int rowNum) throws java.sql.SQLException {
        return new AuditLogEntryResponse(
                rs.getString("id"),
                rs.getString("actor_user_id"),
                rs.getString("action_type"),
                rs.getString("target_id"),
                rs.getString("reason"),
                rs.getTimestamp("created_at").toLocalDateTime());
    }
}
