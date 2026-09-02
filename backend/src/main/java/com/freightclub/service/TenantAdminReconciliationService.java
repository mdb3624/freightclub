package com.freightclub.service;

import com.freightclub.domain.User;
import com.freightclub.repository.UserRepository;
import com.freightclub.security.TenantContextHolder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

// Council-review-driven fix (2026-09-02): TeamService.removeMember/setTenantAdminStatus already
// block reaching zero active admins through the live UI (LastTenantAdminException) — this job
// exists only for paths that check can't cover: legacy data (the pre-existing 13-tenant
// production gap this same change backfills) and any future user-deletion path that bypasses
// TeamService. Deliberately auto-promotes-and-notifies rather than a pending-accept flow: there
// is no live request/user session to attach an accept step to on a scheduled job, and leaving a
// tenant genuinely adminless for a decision window reproduces the exact outage this exists to
// fix. Detection reads through superUserReadJdbcTemplate (BYPASSRLS, same pattern as
// SuperUserDashboardService) since freightclub_runtime's RLS can't see other tenants; the actual
// per-tenant promotion goes through the normal tenant-scoped JPA path via TenantContextHolder,
// the same pattern AuthService's register/login already use for tenant-context-mid-transaction.
@Service
public class TenantAdminReconciliationService {

    private static final Logger log = LoggerFactory.getLogger(TenantAdminReconciliationService.class);

    private final JdbcTemplate superUserReadJdbcTemplate;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public TenantAdminReconciliationService(@Qualifier("superUserReadJdbcTemplate") JdbcTemplate superUserReadJdbcTemplate,
                                             UserRepository userRepository,
                                             EmailService emailService) {
        this.superUserReadJdbcTemplate = superUserReadJdbcTemplate;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    @Scheduled(cron = "${app.tenant-admin-reconciliation.cron:0 0 3 * * *}")
    public void reconcileZeroAdminTenants() {
        List<String> zeroAdminTenantIds = superUserReadJdbcTemplate.queryForList(
                """
                SELECT t.id
                FROM freightclub.tenants t
                JOIN freightclub.users u ON u.tenant_id = t.id AND u.deleted_at IS NULL
                WHERE t.deleted_at IS NULL
                GROUP BY t.id
                HAVING COUNT(*) FILTER (WHERE u.is_tenant_admin) = 0
                """,
                String.class);

        for (String tenantId : zeroAdminTenantIds) {
            try {
                promoteEarliestActiveMember(tenantId);
            } catch (Exception e) {
                log.error("Tenant admin reconciliation failed for tenant {}: {}", tenantId, e.getMessage(), e);
            }
        }
    }

    private void promoteEarliestActiveMember(String tenantId) {
        TenantContextHolder.setTenantId(tenantId);
        try {
            List<User> activeMembers = userRepository.findAllByTenantIdAndDeletedAtIsNullOrderByCreatedAtAsc(tenantId);
            if (activeMembers.isEmpty()) {
                return;
            }
            User promoted = activeMembers.get(0);
            if (promoted.isTenantAdmin()) {
                return;
            }
            promoted.setTenantAdmin(true);
            userRepository.save(promoted);
            log.warn("Tenant admin reconciliation: promoted user {} ({}) to admin for tenant {} — no admin was previously set",
                    promoted.getId(), promoted.getEmail(), tenantId);
            emailService.send(promoted.getEmail(), "[FreightClub] You're now the admin for your company",
                    "Hi " + promoted.getFirstName() + ", your FreightClub account has been set as the admin "
                            + "for your company because no one was previously designated. As admin, you can manage "
                            + "your team and org settings from Settings > Team. If this should be someone else, "
                            + "you can grant admin to another teammate from there.");
        } finally {
            TenantContextHolder.clear();
        }
    }
}
