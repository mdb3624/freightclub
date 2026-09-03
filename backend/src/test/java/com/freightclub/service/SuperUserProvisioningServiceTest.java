package com.freightclub.service;

import com.freightclub.domain.UserRole;
import com.freightclub.exception.EmailAlreadyExistsException;
import com.freightclub.security.LoginLookupRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

// US-886: Super User creates a user in an existing tenant, or a new tenant + first user.
// Reuses US-881's mechanism (unusable password hash + single-use setup token) rather than a
// temporary password.
@ExtendWith(MockitoExtension.class)
class SuperUserProvisioningServiceTest {

    @Mock private JdbcTemplate superUserReadJdbcTemplate;
    @Mock private LoginLookupRepository loginLookupRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AdminAuditLogService adminAuditLogService;
    @Mock private PasswordResetTokenIssuer passwordResetTokenIssuer;

    private SuperUserProvisioningService newService() {
        return new SuperUserProvisioningService(
                superUserReadJdbcTemplate, loginLookupRepository, passwordEncoder, adminAuditLogService, passwordResetTokenIssuer);
    }

    @Test
    void createUserInExistingTenant_insertsUserIssuesTokenAndAudits() {
        when(loginLookupRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(superUserReadJdbcTemplate.queryForList(anyString(), eq(String.class), eq("tenant-1")))
                .thenReturn(List.of("SHIPPER"));
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$hashed");
        when(passwordResetTokenIssuer.issue(anyString())).thenReturn("setup-token-abc");

        SuperUserProvisioningService service = newService();
        String token = service.createUserInExistingTenant(
                "admin-1", "tenant-1", "new@example.com", "New", "User", UserRole.SHIPPER, "Customer requested teammate");

        assertThat(token).isEqualTo("setup-token-abc");
        verify(superUserReadJdbcTemplate).update(
                contains("INSERT INTO freightclub.users"),
                anyString(), eq("tenant-1"), eq("new@example.com"), eq("$2a$hashed"), eq("SHIPPER"), eq("New"), eq("User"));
        verify(adminAuditLogService).record(eq("admin-1"), eq("USER_CREATED"), anyString(), eq("Customer requested teammate"));
    }

    @Test
    void createUserInExistingTenant_rejectsDuplicateEmail() {
        when(loginLookupRepository.existsByEmail("dupe@example.com")).thenReturn(true);
        SuperUserProvisioningService service = newService();

        assertThatThrownBy(() -> service.createUserInExistingTenant(
                "admin-1", "tenant-1", "dupe@example.com", "A", "B", UserRole.SHIPPER, "reason"))
                .isInstanceOf(EmailAlreadyExistsException.class);
        verifyNoInteractions(superUserReadJdbcTemplate, adminAuditLogService, passwordResetTokenIssuer);
    }

    @Test
    void createUserInExistingTenant_rejectsMismatchedPersona() {
        when(loginLookupRepository.existsByEmail(anyString())).thenReturn(false);
        when(superUserReadJdbcTemplate.queryForList(anyString(), eq(String.class), eq("tenant-1")))
                .thenReturn(List.of("SHIPPER"));
        SuperUserProvisioningService service = newService();

        assertThatThrownBy(() -> service.createUserInExistingTenant(
                "admin-1", "tenant-1", "new@example.com", "New", "User", UserRole.TRUCKER, "reason"))
                .isInstanceOf(IllegalArgumentException.class);
        verify(adminAuditLogService, never()).record(any(), any(), any(), any());
    }

    @Test
    void createUserInExistingTenant_rejectsBlankReason() {
        SuperUserProvisioningService service = newService();

        assertThatThrownBy(() -> service.createUserInExistingTenant(
                "admin-1", "tenant-1", "new@example.com", "New", "User", UserRole.SHIPPER, " "))
                .isInstanceOf(IllegalArgumentException.class);
        verifyNoInteractions(superUserReadJdbcTemplate, loginLookupRepository, adminAuditLogService);
    }

    @Test
    void createNewTenantWithFirstUser_insertsTenantAndAdminUserAndAudits() {
        when(loginLookupRepository.existsByEmail("owner@example.com")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$hashed");
        when(passwordResetTokenIssuer.issue(anyString())).thenReturn("setup-token-xyz");

        SuperUserProvisioningService service = newService();
        String token = service.createNewTenantWithFirstUser(
                "admin-1", "Acme Freight", "owner@example.com", "Own", "Er", UserRole.SHIPPER, "Phone signup");

        assertThat(token).isEqualTo("setup-token-xyz");
        verify(superUserReadJdbcTemplate).update(contains("INSERT INTO freightclub.tenants"), anyString(), eq("Acme Freight"), anyString());
        verify(superUserReadJdbcTemplate).update(
                contains("INSERT INTO freightclub.users"),
                anyString(), anyString(), eq("owner@example.com"), eq("$2a$hashed"), eq("SHIPPER"), eq("Own"), eq("Er"), eq(true));
        verify(adminAuditLogService).record(eq("admin-1"), eq("TENANT_AND_USER_CREATED"), anyString(), eq("Phone signup"));
    }
}
