package com.freightclub.controller;

import com.freightclub.dto.SuperUserDashboardResponse;
import com.freightclub.service.SuperUserDashboardService;
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

import java.util.List;
import java.util.Map;

import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// US-750 AC-2: ROLE_ADMIN (Super User) only — SHIPPER_ADMIN/CARRIER_ADMIN (ROLE_TENANT_ADMIN)
// must not see cross-tenant data (US-874's unrelated tenant-scoped capability).
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SuperUserDashboardControllerTest {

    @MockBean private SuperUserDashboardService superUserDashboardService;

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
    void getDashboard_ok_forSuperUser() throws Exception {
        when(superUserDashboardService.getDashboard()).thenReturn(new SuperUserDashboardResponse(
                2L, Map.of("SHIPPER", 5L), Map.of("OPEN", 3L), List.of()));

        mockMvc.perform(get("/api/v1/super-user/dashboard").with(superUser("admin-1")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tenantCount").value(2));
    }

    @Test
    void getDashboard_forbidden_forTenantAdmin() throws Exception {
        mockMvc.perform(get("/api/v1/super-user/dashboard").with(tenantAdmin("tenant-admin-1")))
                .andExpect(status().isForbidden());

        verify(superUserDashboardService, never()).getDashboard();
    }
}
