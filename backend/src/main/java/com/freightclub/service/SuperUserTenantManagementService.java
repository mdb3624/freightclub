package com.freightclub.service;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

// US-884: tenant-level suspend/reactivate. Mirrors SuperUserAccountManagementService's
// user-level pattern exactly — each action + its audit entry (US-880) run inside
// superUserTransactionManager's transaction so they succeed or fail together (BR-2). Suspending
// a tenant also revokes every one of its users' sessions (AC-1) via the same best-effort,
// separate-transaction refresh-token cleanup already used for user-level suspend.
@Service
public class SuperUserTenantManagementService {

    private final JdbcTemplate superUserReadJdbcTemplate;
    private final AdminAuditLogService adminAuditLogService;
    private final com.freightclub.security.RefreshTokenService refreshTokenService;

    public SuperUserTenantManagementService(@Qualifier("superUserReadJdbcTemplate") JdbcTemplate superUserReadJdbcTemplate,
                                             AdminAuditLogService adminAuditLogService,
                                             com.freightclub.security.RefreshTokenService refreshTokenService) {
        this.superUserReadJdbcTemplate = superUserReadJdbcTemplate;
        this.adminAuditLogService = adminAuditLogService;
        this.refreshTokenService = refreshTokenService;
    }

    @Transactional("superUserTransactionManager")
    public void suspendTenant(String actorUserId, String tenantId, String reason) {
        requireReason(reason);

        superUserReadJdbcTemplate.update(
                "UPDATE freightclub.tenants SET is_suspended = true WHERE id = ?", tenantId);
        adminAuditLogService.record(actorUserId, "TENANT_SUSPENDED", tenantId, reason);

        // freightclub_super_user_read is only granted (id, tenant_id, role, deleted_at) on
        // users (V20260901_1200) — enough to enumerate the tenant's members for session
        // revocation without widening that grant.
        List<String> memberUserIds = superUserReadJdbcTemplate.queryForList(
                "SELECT id FROM freightclub.users WHERE tenant_id = ? AND deleted_at IS NULL",
                String.class, tenantId);
        memberUserIds.forEach(refreshTokenService::revokeAllForUser);
    }

    @Transactional("superUserTransactionManager")
    public void reactivateTenant(String actorUserId, String tenantId, String reason) {
        requireReason(reason);

        superUserReadJdbcTemplate.update(
                "UPDATE freightclub.tenants SET is_suspended = false WHERE id = ?", tenantId);
        adminAuditLogService.record(actorUserId, "TENANT_REACTIVATED", tenantId, reason);
    }

    private void requireReason(String reason) {
        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("A reason is required for this action");
        }
    }
}
