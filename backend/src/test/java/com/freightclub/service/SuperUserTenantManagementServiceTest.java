package com.freightclub.service;

import com.freightclub.security.RefreshTokenService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

// US-884: suspend/reactivate a tenant, each requiring a mandatory reason and writing an audit
// entry (US-880) in the same superUserTransactionManager transaction as the state change
// itself — same pattern as SuperUserAccountManagementServiceTest's user-level coverage.
@ExtendWith(MockitoExtension.class)
class SuperUserTenantManagementServiceTest {

    @Mock private JdbcTemplate superUserReadJdbcTemplate;
    @Mock private AdminAuditLogService adminAuditLogService;
    @Mock private RefreshTokenService refreshTokenService;

    private SuperUserTenantManagementService newService() {
        return new SuperUserTenantManagementService(superUserReadJdbcTemplate, adminAuditLogService, refreshTokenService);
    }

    @Test
    void suspendTenant_setsFlagRevokesMemberSessionsAndAudits() {
        SuperUserTenantManagementService service = newService();
        when(superUserReadJdbcTemplate.queryForList(
                contains("SELECT id FROM freightclub.users"), eq(String.class), eq("tenant-1")))
                .thenReturn(List.of("user-1", "user-2"));

        service.suspendTenant("admin-1", "tenant-1", "Non-payment");

        verify(superUserReadJdbcTemplate).update(contains("is_suspended = true"), eq("tenant-1"));
        verify(adminAuditLogService).record("admin-1", "TENANT_SUSPENDED", "tenant-1", "Non-payment");
        verify(refreshTokenService).revokeAllForUser("user-1");
        verify(refreshTokenService).revokeAllForUser("user-2");
    }

    @Test
    void suspendTenant_rejectsBlankReason() {
        SuperUserTenantManagementService service = newService();

        assertThatThrownBy(() -> service.suspendTenant("admin-1", "tenant-1", "  "))
                .isInstanceOf(IllegalArgumentException.class);
        verifyNoInteractions(superUserReadJdbcTemplate, adminAuditLogService, refreshTokenService);
    }

    @Test
    void reactivateTenant_clearsFlagAndAudits() {
        SuperUserTenantManagementService service = newService();

        service.reactivateTenant("admin-1", "tenant-1", "Investigation cleared");

        verify(superUserReadJdbcTemplate).update(contains("is_suspended = false"), eq("tenant-1"));
        verify(adminAuditLogService).record("admin-1", "TENANT_REACTIVATED", "tenant-1", "Investigation cleared");
        verifyNoInteractions(refreshTokenService);
    }

    @Test
    void reactivateTenant_rejectsBlankReason() {
        SuperUserTenantManagementService service = newService();

        assertThatThrownBy(() -> service.reactivateTenant("admin-1", "tenant-1", null))
                .isInstanceOf(IllegalArgumentException.class);
        verifyNoInteractions(superUserReadJdbcTemplate, adminAuditLogService);
    }
}
