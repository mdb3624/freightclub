package com.freightclub.service;

import com.freightclub.exception.CannotSuspendSelfException;
import com.freightclub.security.RefreshTokenService;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.UUID;

// US-881: suspend/reactivate/force-password-reset. Each action + its audit entry (US-880) run
// inside superUserTransactionManager's transaction (same DataSource as
// superUserReadJdbcTemplate) so they succeed or fail together (BR-3). Refresh-token revocation
// runs through the existing RefreshTokenService/main JPA datasource — a separate transaction,
// since refresh_tokens has no RLS and doesn't need the super-user-read path at all; it's
// best-effort session cleanup layered onto the primary governed action, not the action itself.
@Service
public class SuperUserAccountManagementService {

    private final JdbcTemplate superUserReadJdbcTemplate;
    private final AdminAuditLogService adminAuditLogService;
    private final RefreshTokenService refreshTokenService;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom secureRandom = new SecureRandom();

    public SuperUserAccountManagementService(@Qualifier("superUserReadJdbcTemplate") JdbcTemplate superUserReadJdbcTemplate,
                                              AdminAuditLogService adminAuditLogService,
                                              RefreshTokenService refreshTokenService,
                                              PasswordEncoder passwordEncoder) {
        this.superUserReadJdbcTemplate = superUserReadJdbcTemplate;
        this.adminAuditLogService = adminAuditLogService;
        this.refreshTokenService = refreshTokenService;
        this.passwordEncoder = passwordEncoder;
    }

    // US-881 BR-5/AC-5
    @Transactional("superUserTransactionManager")
    public void suspendUser(String actorUserId, String targetUserId, String reason) {
        if (actorUserId.equals(targetUserId)) {
            throw new CannotSuspendSelfException();
        }
        requireReason(reason);

        superUserReadJdbcTemplate.update(
                "UPDATE freightclub.users SET is_suspended = true WHERE id = ?", targetUserId);
        adminAuditLogService.record(actorUserId, "USER_SUSPENDED", targetUserId, reason);
        refreshTokenService.revokeAllForUser(targetUserId);
    }

    @Transactional("superUserTransactionManager")
    public void reactivateUser(String actorUserId, String targetUserId, String reason) {
        requireReason(reason);

        superUserReadJdbcTemplate.update(
                "UPDATE freightclub.users SET is_suspended = false WHERE id = ?", targetUserId);
        adminAuditLogService.record(actorUserId, "USER_REACTIVATED", targetUserId, reason);
    }

    // US-881 BR-4 (corrected during implementation — no password-reset-email flow exists in this
    // codebase): invalidates the current password by overwriting it with a random,
    // Super-User-unknowable hash, then issues a single-use reset token the Super User relays
    // out-of-band. Returns the raw token — never the new password (AC-4).
    @Transactional("superUserTransactionManager")
    public String forcePasswordReset(String actorUserId, String targetUserId, String reason) {
        requireReason(reason);

        String unusablePasswordHash = passwordEncoder.encode(UUID.randomUUID().toString());
        superUserReadJdbcTemplate.update(
                "UPDATE freightclub.users SET password_hash = ? WHERE id = ?", unusablePasswordHash, targetUserId);

        String rawToken = generateRawToken();
        String tokenHash = hashToken(rawToken);
        superUserReadJdbcTemplate.update(
                "INSERT INTO freightclub.password_reset_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)",
                UUID.randomUUID().toString(), targetUserId, tokenHash, LocalDateTime.now().plusHours(1));

        adminAuditLogService.record(actorUserId, "PASSWORD_RESET_FORCED", targetUserId, reason);
        refreshTokenService.revokeAllForUser(targetUserId);
        return rawToken;
    }

    private void requireReason(String reason) {
        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("A reason is required for this action");
        }
    }

    private String generateRawToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hashToken(String rawToken) {
        try {
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes());
            return Base64.getEncoder().encodeToString(hash);
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
