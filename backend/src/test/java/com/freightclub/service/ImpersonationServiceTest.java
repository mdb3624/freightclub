package com.freightclub.service;

import com.freightclub.domain.User;
import com.freightclub.domain.UserRole;
import com.freightclub.dto.ImpersonationStartResponse;
import com.freightclub.exception.CannotImpersonateAdminException;
import com.freightclub.exception.InvalidReauthenticationException;
import com.freightclub.repository.UserRepository;
import com.freightclub.security.JwtService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

// US-885: highest-risk story in the batch — re-auth (BR-6), ADMIN-target rejection (BR-5),
// mandatory reason (AC-6), and audit-on-start (BR-3) all fail closed before any session exists.
@ExtendWith(MockitoExtension.class)
class ImpersonationServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtService jwtService;
    @Mock private JdbcTemplate superUserReadJdbcTemplate;
    @Mock private AdminAuditLogService adminAuditLogService;

    private ImpersonationService newService() {
        ImpersonationService service = new ImpersonationService(
                userRepository, passwordEncoder, jwtService, superUserReadJdbcTemplate, adminAuditLogService);
        ReflectionTestUtils.setField(service, "durationMinutes", 15);
        return service;
    }

    private User makeUser(String id, UserRole role) {
        User user = new User();
        setField(user, "id", id);
        user.setEmail(id + "@example.com");
        user.setRole(role);
        user.setTenantId("tenant-1");
        user.setPasswordHash("$2a$hashed");
        return user;
    }

    private static void setField(Object target, String name, Object value) {
        try {
            Field f = target.getClass().getDeclaredField(name);
            f.setAccessible(true);
            f.set(target, value);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    void start_rejectsBlankReason() {
        ImpersonationService service = newService();

        assertThatThrownBy(() -> service.start("admin-1", "target-1", " ", "password"))
                .isInstanceOf(IllegalArgumentException.class);
        verifyNoInteractions(userRepository, jwtService, superUserReadJdbcTemplate, adminAuditLogService);
    }

    @Test
    void start_rejectsInvalidReauthentication() {
        ImpersonationService service = newService();
        User actor = makeUser("admin-1", UserRole.ADMIN);
        when(userRepository.findById("admin-1")).thenReturn(Optional.of(actor));
        when(passwordEncoder.matches("wrong-password", "$2a$hashed")).thenReturn(false);

        assertThatThrownBy(() -> service.start("admin-1", "target-1", "reason", "wrong-password"))
                .isInstanceOf(InvalidReauthenticationException.class);
        verifyNoInteractions(superUserReadJdbcTemplate, jwtService, adminAuditLogService);
    }

    @Test
    @SuppressWarnings("unchecked")
    void start_rejectsImpersonatingAnotherAdmin() {
        ImpersonationService service = newService();
        User actor = makeUser("admin-1", UserRole.ADMIN);
        when(userRepository.findById("admin-1")).thenReturn(Optional.of(actor));
        when(passwordEncoder.matches("password", "$2a$hashed")).thenReturn(true);
        when(superUserReadJdbcTemplate.query(anyString(), any(RowMapper.class), eq("other-admin")))
                .thenAnswer(inv -> {
                    RowMapper<Object> mapper = inv.getArgument(1);
                    return List.of(mapper.mapRow(fakeRow("other-admin", "tenant-2", "ADMIN", "a@example.com", "A", "B", false), 0));
                });

        assertThatThrownBy(() -> service.start("admin-1", "other-admin", "reason", "password"))
                .isInstanceOf(CannotImpersonateAdminException.class);
        verifyNoInteractions(adminAuditLogService, jwtService);
    }

    @Test
    @SuppressWarnings("unchecked")
    void start_rejectsWhenTargetNotFound() {
        ImpersonationService service = newService();
        User actor = makeUser("admin-1", UserRole.ADMIN);
        when(userRepository.findById("admin-1")).thenReturn(Optional.of(actor));
        when(passwordEncoder.matches("password", "$2a$hashed")).thenReturn(true);
        when(superUserReadJdbcTemplate.query(anyString(), any(RowMapper.class), eq("missing")))
                .thenReturn(List.of());

        assertThatThrownBy(() -> service.start("admin-1", "missing", "reason", "password"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @SuppressWarnings("unchecked")
    void start_issuesTokenAndAuditsAndPersistsSession() {
        ImpersonationService service = newService();
        User actor = makeUser("admin-1", UserRole.ADMIN);
        when(userRepository.findById("admin-1")).thenReturn(Optional.of(actor));
        when(passwordEncoder.matches("password", "$2a$hashed")).thenReturn(true);
        when(superUserReadJdbcTemplate.query(anyString(), any(RowMapper.class), eq("target-1")))
                .thenAnswer(inv -> {
                    RowMapper<Object> mapper = inv.getArgument(1);
                    return List.of(mapper.mapRow(fakeRow("target-1", "tenant-2", "SHIPPER", "s@example.com", "S", "User", false), 0));
                });
        when(jwtService.generateImpersonationToken(eq("target-1"), eq("s@example.com"), eq("SHIPPER"), eq("tenant-2"),
                eq(false), eq("admin-1"), anyString(), eq(15 * 60_000L)))
                .thenReturn("impersonation-jwt");

        ImpersonationStartResponse response = service.start("admin-1", "target-1", "Support ticket #42", "password");

        assertThat(response.impersonationToken()).isEqualTo("impersonation-jwt");
        assertThat(response.target().email()).isEqualTo("s@example.com");
        verify(superUserReadJdbcTemplate).update(contains("INSERT INTO freightclub.impersonation_sessions"),
                eq(response.sessionId()), eq("admin-1"), eq("target-1"), any());
        verify(adminAuditLogService).record("admin-1", "IMPERSONATION_STARTED", "target-1", "Support ticket #42");
    }

    @Test
    void end_marksSessionEndedAndAudits() {
        ImpersonationService service = newService();
        when(superUserReadJdbcTemplate.queryForList(contains("SELECT target_user_id"), eq(String.class), eq("session-1"), eq("admin-1")))
                .thenReturn(List.of("target-1"));

        service.end("admin-1", "session-1");

        verify(superUserReadJdbcTemplate).update(contains("end_reason = 'MANUAL'"), eq("session-1"));
        verify(adminAuditLogService).record("admin-1", "IMPERSONATION_ENDED", "target-1", "Manually ended");
    }

    @Test
    void end_isIdempotent_whenSessionAlreadyEnded() {
        ImpersonationService service = newService();
        when(superUserReadJdbcTemplate.queryForList(contains("SELECT target_user_id"), eq(String.class), eq("session-1"), eq("admin-1")))
                .thenReturn(List.of());

        service.end("admin-1", "session-1");

        verifyNoInteractions(adminAuditLogService);
    }

    private java.sql.ResultSet fakeRow(String id, String tenantId, String role, String email, String firstName, String lastName, boolean isTenantAdmin) {
        java.sql.ResultSet rs = mock(java.sql.ResultSet.class);
        try {
            when(rs.getString("id")).thenReturn(id);
            when(rs.getString("tenant_id")).thenReturn(tenantId);
            when(rs.getString("role")).thenReturn(role);
            when(rs.getString("email")).thenReturn(email);
            when(rs.getString("first_name")).thenReturn(firstName);
            when(rs.getString("last_name")).thenReturn(lastName);
            when(rs.getBoolean("is_tenant_admin")).thenReturn(isTenantAdmin);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return rs;
    }
}
