package com.freightclub.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

// US-880 BR-2: append-only is enforced at the DB grant level (V20260902_1100 — SELECT, INSERT
// only, no UPDATE/DELETE granted to freightclub_super_user_read), not just application code.
// This test verifies that guarantee directly against a real Postgres connection using that
// exact role — a fake/mocked JdbcTemplate can't prove a permission-denied error actually fires.
@SpringBootTest
@ActiveProfiles("test")
class AdminAuditLogAppendOnlyIntegrationTest {

    @Autowired
    @Qualifier("superUserReadJdbcTemplate")
    private JdbcTemplate superUserReadJdbcTemplate;

    @Autowired
    private AdminAuditLogService adminAuditLogService;

    // Stable seeded user (V99999999_0001__TestSeedData.sql) — satisfies admin_audit_log's
    // actor_user_id FK without needing to register a fresh user via TestAuthController.
    private static final String SEEDED_USER_ID = "11111111-1111-1111-1111-111111111111";

    @Test
    void update_isRejected_byDatabaseGrant() {
        adminAuditLogService.record(SEEDED_USER_ID, "USER_SUSPENDED", "target-int-test", "integration test seed row");

        assertThatThrownBy(() ->
                superUserReadJdbcTemplate.update(
                        "UPDATE freightclub.admin_audit_log SET reason = 'tampered' WHERE target_id = ?",
                        "target-int-test"))
                .isInstanceOf(DataAccessException.class);
    }

    @Test
    void delete_isRejected_byDatabaseGrant() {
        adminAuditLogService.record(SEEDED_USER_ID, "USER_SUSPENDED", "target-int-test-2", "integration test seed row");

        assertThatThrownBy(() ->
                superUserReadJdbcTemplate.update(
                        "DELETE FROM freightclub.admin_audit_log WHERE target_id = ?",
                        "target-int-test-2"))
                .isInstanceOf(DataAccessException.class);
    }
}
