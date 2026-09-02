package com.freightclub.service;

import com.freightclub.exception.CannotSuspendSelfException;
import com.freightclub.security.RefreshTokenService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

// US-881: suspend/reactivate/force-password-reset, each requiring a mandatory reason and
// writing an audit entry (US-880) in the same superUserTransactionManager transaction as the
// state change itself.
@ExtendWith(MockitoExtension.class)
class SuperUserAccountManagementServiceTest {

    @Mock private JdbcTemplate superUserReadJdbcTemplate;
    @Mock private AdminAuditLogService adminAuditLogService;
    @Mock private RefreshTokenService refreshTokenService;
    @Mock private PasswordEncoder passwordEncoder;

    private SuperUserAccountManagementService newService() {
        return new SuperUserAccountManagementService(
                superUserReadJdbcTemplate, adminAuditLogService, refreshTokenService, passwordEncoder);
    }

    @Test
    void suspendUser_setsFlagRevokesSessionsAndAudits() {
        SuperUserAccountManagementService service = newService();

        service.suspendUser("admin-1", "user-1", "Reported for fraud");

        verify(superUserReadJdbcTemplate).update(
                contains("is_suspended = true"), eq("user-1"));
        verify(adminAuditLogService).record("admin-1", "USER_SUSPENDED", "user-1", "Reported for fraud");
        verify(refreshTokenService).revokeAllForUser("user-1");
    }

    @Test
    void suspendUser_rejectsSelfSuspend() {
        SuperUserAccountManagementService service = newService();

        assertThatThrownBy(() -> service.suspendUser("admin-1", "admin-1", "reason"))
                .isInstanceOf(CannotSuspendSelfException.class);
        verifyNoInteractions(superUserReadJdbcTemplate, adminAuditLogService, refreshTokenService);
    }

    @Test
    void suspendUser_rejectsBlankReason() {
        SuperUserAccountManagementService service = newService();

        assertThatThrownBy(() -> service.suspendUser("admin-1", "user-1", "  "))
                .isInstanceOf(IllegalArgumentException.class);
        verifyNoInteractions(superUserReadJdbcTemplate, refreshTokenService);
    }

    @Test
    void reactivateUser_clearsFlagAndAudits() {
        SuperUserAccountManagementService service = newService();

        service.reactivateUser("admin-1", "user-1", "Investigation cleared");

        verify(superUserReadJdbcTemplate).update(
                contains("is_suspended = false"), eq("user-1"));
        verify(adminAuditLogService).record("admin-1", "USER_REACTIVATED", "user-1", "Investigation cleared");
    }

    @Test
    void forcePasswordReset_invalidatesPasswordIssuesTokenRevokesSessionsAndAudits() {
        SuperUserAccountManagementService service = newService();
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$hashed");

        String rawToken = service.forcePasswordReset("admin-1", "user-1", "Suspected compromise");

        assertThat(rawToken).isNotBlank();
        verify(superUserReadJdbcTemplate).update(
                contains("password_hash = ?"), eq("$2a$hashed"), eq("user-1"));
        verify(superUserReadJdbcTemplate).update(
                contains("INSERT INTO freightclub.password_reset_tokens"),
                anyString(), eq("user-1"), anyString(), any());
        verify(adminAuditLogService).record("admin-1", "PASSWORD_RESET_FORCED", "user-1", "Suspected compromise");
        verify(refreshTokenService).revokeAllForUser("user-1");
    }

    @Test
    void forcePasswordReset_rejectsBlankReason() {
        SuperUserAccountManagementService service = newService();

        assertThatThrownBy(() -> service.forcePasswordReset("admin-1", "user-1", null))
                .isInstanceOf(IllegalArgumentException.class);
        verifyNoInteractions(superUserReadJdbcTemplate, refreshTokenService, passwordEncoder);
    }
}
