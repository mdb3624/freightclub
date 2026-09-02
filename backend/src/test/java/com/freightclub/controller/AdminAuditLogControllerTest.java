package com.freightclub.controller;

import com.freightclub.dto.AuditLogEntryResponse;
import com.freightclub.service.AdminAuditLogService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminAuditLogControllerTest {

    @MockBean private AdminAuditLogService adminAuditLogService;

    @Autowired private MockMvc mockMvc;

    private static RequestPostProcessor superUser(String id) {
        return authentication(new UsernamePasswordAuthenticationToken(
                id, null, List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))));
    }

    private static RequestPostProcessor tenantAdmin(String id) {
        return authentication(new UsernamePasswordAuthenticationToken(
                id, null, List.of(new SimpleGrantedAuthority("ROLE_SHIPPER"), new SimpleGrantedAuthority("ROLE_TENANT_ADMIN"))));
    }

    @Test
    void list_ok_forSuperUser() throws Exception {
        when(adminAuditLogService.list(null)).thenReturn(List.of(
                new AuditLogEntryResponse("id-1", "admin-1", "USER_SUSPENDED", "user-1", "fraud report", LocalDateTime.now())));

        mockMvc.perform(get("/api/v1/super-user/audit-log").with(superUser("admin-1")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].actionType").value("USER_SUSPENDED"));
    }

    @Test
    void list_filtersByTargetId() throws Exception {
        when(adminAuditLogService.list("user-1")).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/super-user/audit-log?targetId=user-1").with(superUser("admin-1")))
                .andExpect(status().isOk());

        verify(adminAuditLogService).list(eq("user-1"));
    }

    @Test
    void list_forbidden_forTenantAdmin() throws Exception {
        mockMvc.perform(get("/api/v1/super-user/audit-log").with(tenantAdmin("tenant-admin-1")))
                .andExpect(status().isForbidden());

        verifyNoInteractions(adminAuditLogService);
    }
}
