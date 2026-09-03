package com.freightclub.service;

import com.freightclub.domain.User;
import com.freightclub.domain.UserRole;
import com.freightclub.dto.ImpersonationStartResponse;
import com.freightclub.dto.TargetUserSummary;
import com.freightclub.exception.CannotImpersonateAdminException;
import com.freightclub.exception.InvalidReauthenticationException;
import com.freightclub.repository.UserRepository;
import com.freightclub.security.JwtService;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

// US-885: the highest-risk story in the "Super User feature gaps" batch — ships last,
// deliberately, after US-880 (audit) and US-881 (suspend, the immediate-lockout companion
// action) are already proven. View-only by default per the story's own recommendation (write
// enforcement lives in JwtAuthenticationFilter, keyed off the token's `impersonating` claim,
// not here) — the write-permission question is explicitly left open for a future story.
@Service
public class ImpersonationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final JdbcTemplate superUserReadJdbcTemplate;
    private final AdminAuditLogService adminAuditLogService;

    @Value("${app.impersonation.duration-minutes:15}")
    private int durationMinutes;

    public ImpersonationService(UserRepository userRepository,
                                 PasswordEncoder passwordEncoder,
                                 JwtService jwtService,
                                 @Qualifier("superUserReadJdbcTemplate") JdbcTemplate superUserReadJdbcTemplate,
                                 AdminAuditLogService adminAuditLogService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.superUserReadJdbcTemplate = superUserReadJdbcTemplate;
        this.adminAuditLogService = adminAuditLogService;
    }

    @Transactional("superUserTransactionManager")
    public ImpersonationStartResponse start(String superUserId, String targetUserId, String reason, String password) {
        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("A reason is required for this action"); // AC-6
        }

        // BR-6/AC-4: re-authentication — a valid Super User session alone is not enough.
        // The actor's own row is in their own tenant, already bound via TenantContextHolder
        // by JwtAuthenticationFilter, so the normal tenant-scoped JPA path applies.
        User actor = userRepository.findById(superUserId)
                .orElseThrow(() -> new IllegalStateException("Super User disappeared mid-request"));
        if (!passwordEncoder.matches(password, actor.getPasswordHash())) {
            throw new InvalidReauthenticationException();
        }

        TargetRow target = fetchTarget(targetUserId);
        if (target == null) {
            throw new IllegalArgumentException("Target user not found");
        }
        if (target.role() == UserRole.ADMIN) {
            throw new CannotImpersonateAdminException(); // BR-5/AC-5
        }

        String sessionId = UUID.randomUUID().toString();
        Instant expiresAt = Instant.now().plus(Duration.ofMinutes(durationMinutes));

        superUserReadJdbcTemplate.update(
                "INSERT INTO freightclub.impersonation_sessions (id, super_user_id, target_user_id, expires_at) VALUES (?, ?, ?, ?)",
                sessionId, superUserId, targetUserId, Timestamp.from(expiresAt));
        adminAuditLogService.record(superUserId, "IMPERSONATION_STARTED", targetUserId, reason); // BR-3/AC-1

        String token = jwtService.generateImpersonationToken(
                target.id(), target.email(), target.role().name(), target.tenantId(), target.isTenantAdmin(),
                superUserId, sessionId, Duration.ofMinutes(durationMinutes).toMillis());

        return new ImpersonationStartResponse(token, sessionId, expiresAt,
                new TargetUserSummary(target.id(), target.email(), target.firstName(), target.lastName(), target.role().name()));
    }

    // BR-3/AC-3: called with the real Super User id recovered from ImpersonationContextHolder
    // (the request's @AuthenticationPrincipal is the impersonated TARGET's id, not theirs).
    @Transactional("superUserTransactionManager")
    public void end(String superUserId, String sessionId) {
        List<String> targetUserIds = superUserReadJdbcTemplate.queryForList(
                "SELECT target_user_id FROM freightclub.impersonation_sessions WHERE id = ? AND super_user_id = ? AND ended_at IS NULL",
                String.class, sessionId, superUserId);
        if (targetUserIds.isEmpty()) {
            return; // already ended (e.g. beaten by the timeout reconciliation job) — idempotent
        }

        superUserReadJdbcTemplate.update(
                "UPDATE freightclub.impersonation_sessions SET ended_at = CURRENT_TIMESTAMP, end_reason = 'MANUAL' WHERE id = ?",
                sessionId);
        adminAuditLogService.record(superUserId, "IMPERSONATION_ENDED", targetUserIds.get(0), "Manually ended");
    }

    private TargetRow fetchTarget(String targetUserId) {
        List<TargetRow> rows = superUserReadJdbcTemplate.query(
                """
                SELECT id, tenant_id, role, email, first_name, last_name, is_tenant_admin
                FROM freightclub.users
                WHERE id = ? AND deleted_at IS NULL
                """,
                (rs, rowNum) -> new TargetRow(
                        rs.getString("id"),
                        rs.getString("tenant_id"),
                        UserRole.valueOf(rs.getString("role")),
                        rs.getString("email"),
                        rs.getString("first_name"),
                        rs.getString("last_name"),
                        rs.getBoolean("is_tenant_admin")),
                targetUserId);
        return rows.isEmpty() ? null : rows.get(0);
    }

    private record TargetRow(String id, String tenantId, UserRole role, String email,
                              String firstName, String lastName, boolean isTenantAdmin) {}
}
