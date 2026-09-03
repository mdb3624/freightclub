package com.freightclub.service;

import com.freightclub.domain.UserRole;
import com.freightclub.exception.EmailAlreadyExistsException;
import com.freightclub.security.LoginLookupRepository;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;
import java.util.UUID;

// US-886: Super User creates a user in an existing tenant, or a new tenant + its first user —
// the Super-User-initiated equivalent of AuthService.register()'s join-code and new-company
// paths. Reuses US-881's mechanism (unusable random password hash + single-use setup token,
// via the shared PasswordResetTokenIssuer) rather than a temporary password (corrected during
// implementation — see the story's Decision Log). Runs through superUserReadJdbcTemplate /
// superUserTransactionManager so creation and its audit entry (US-880) share one transaction.
@Service
public class SuperUserProvisioningService {

    private final JdbcTemplate superUserReadJdbcTemplate;
    private final LoginLookupRepository loginLookupRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdminAuditLogService adminAuditLogService;
    private final PasswordResetTokenIssuer passwordResetTokenIssuer;
    private final SecureRandom secureRandom = new SecureRandom();

    private static final String JOIN_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int JOIN_CODE_LENGTH = 8;

    public SuperUserProvisioningService(@Qualifier("superUserReadJdbcTemplate") JdbcTemplate superUserReadJdbcTemplate,
                                         LoginLookupRepository loginLookupRepository,
                                         PasswordEncoder passwordEncoder,
                                         AdminAuditLogService adminAuditLogService,
                                         PasswordResetTokenIssuer passwordResetTokenIssuer) {
        this.superUserReadJdbcTemplate = superUserReadJdbcTemplate;
        this.loginLookupRepository = loginLookupRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminAuditLogService = adminAuditLogService;
        this.passwordResetTokenIssuer = passwordResetTokenIssuer;
    }

    // BR-1: role must match the tenant's existing persona — a tenant is one persona
    // (SHIPPER or TRUCKER), never mixed, per the existing data model.
    @Transactional("superUserTransactionManager")
    public String createUserInExistingTenant(String actorUserId, String tenantId, String email,
                                              String firstName, String lastName, UserRole role, String reason) {
        requireReason(reason);
        if (loginLookupRepository.existsByEmail(email)) {
            throw new EmailAlreadyExistsException(email);
        }

        List<String> existingRoles = superUserReadJdbcTemplate.queryForList(
                "SELECT DISTINCT role FROM freightclub.users WHERE tenant_id = ? AND deleted_at IS NULL",
                String.class, tenantId);
        if (!existingRoles.isEmpty() && !existingRoles.contains(role.name())) {
            throw new IllegalArgumentException(
                    "This tenant's existing members are " + existingRoles.get(0) + "; cannot add a " + role.name());
        }

        String userId = UUID.randomUUID().toString();
        String unusablePasswordHash = passwordEncoder.encode(UUID.randomUUID().toString());
        superUserReadJdbcTemplate.update(
                "INSERT INTO freightclub.users (id, tenant_id, email, password_hash, role, first_name, last_name) "
                        + "VALUES (?, ?, ?, ?, ?, ?, ?)",
                userId, tenantId, email, unusablePasswordHash, role.name(), firstName, lastName);

        String rawToken = passwordResetTokenIssuer.issue(userId);
        adminAuditLogService.record(actorUserId, "USER_CREATED", userId, reason);
        return rawToken;
    }

    // BR-2: mirrors AuthService.register()'s new-company path — the created user is
    // automatically is_tenant_admin = true.
    @Transactional("superUserTransactionManager")
    public String createNewTenantWithFirstUser(String actorUserId, String companyName, String email,
                                                String firstName, String lastName, UserRole role, String reason) {
        requireReason(reason);
        if (loginLookupRepository.existsByEmail(email)) {
            throw new EmailAlreadyExistsException(email);
        }

        String tenantId = UUID.randomUUID().toString();
        superUserReadJdbcTemplate.update(
                "INSERT INTO freightclub.tenants (id, name, join_code) VALUES (?, ?, ?)",
                tenantId, companyName, generateJoinCode());

        String userId = UUID.randomUUID().toString();
        String unusablePasswordHash = passwordEncoder.encode(UUID.randomUUID().toString());
        superUserReadJdbcTemplate.update(
                "INSERT INTO freightclub.users (id, tenant_id, email, password_hash, role, first_name, last_name, is_tenant_admin) "
                        + "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                userId, tenantId, email, unusablePasswordHash, role.name(), firstName, lastName, true);

        String rawToken = passwordResetTokenIssuer.issue(userId);
        adminAuditLogService.record(actorUserId, "TENANT_AND_USER_CREATED", userId, reason);
        return rawToken;
    }

    private void requireReason(String reason) {
        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("A reason is required for this action");
        }
    }

    private String generateJoinCode() {
        StringBuilder sb = new StringBuilder(JOIN_CODE_LENGTH);
        for (int i = 0; i < JOIN_CODE_LENGTH; i++) {
            sb.append(JOIN_CODE_CHARS.charAt(secureRandom.nextInt(JOIN_CODE_CHARS.length())));
        }
        return sb.toString();
    }
}
