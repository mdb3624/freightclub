package com.freightclub.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.freightclub.domain.UserRole;
import com.freightclub.dto.CreateTenantWithFirstUserRequest;
import com.freightclub.service.SuperUserProvisioningService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SuperUserTenantProvisioningControllerTest {

    @MockBean private SuperUserProvisioningService superUserProvisioningService;

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    private static RequestPostProcessor superUser(String id) {
        return authentication(new UsernamePasswordAuthenticationToken(
                id, null, List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))));
    }

    private static RequestPostProcessor tenantAdmin(String id) {
        return authentication(new UsernamePasswordAuthenticationToken(
                id, null, List.of(new SimpleGrantedAuthority("ROLE_SHIPPER"), new SimpleGrantedAuthority("ROLE_TENANT_ADMIN"))));
    }

    @Test
    void createTenantWithFirstUser_returnsSetupToken_forSuperUser() throws Exception {
        CreateTenantWithFirstUserRequest request = new CreateTenantWithFirstUserRequest(
                "Acme Freight", "owner@example.com", "Own", "Er", UserRole.SHIPPER, "Phone signup");
        when(superUserProvisioningService.createNewTenantWithFirstUser(
                "admin-1", "Acme Freight", "owner@example.com", "Own", "Er", UserRole.SHIPPER, "Phone signup"))
                .thenReturn("setup-token-xyz");

        mockMvc.perform(post("/api/v1/super-user/tenants").with(superUser("admin-1"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.setupToken").value("setup-token-xyz"));
    }

    @Test
    void createTenantWithFirstUser_forbidden_forTenantAdmin() throws Exception {
        CreateTenantWithFirstUserRequest request = new CreateTenantWithFirstUserRequest(
                "Acme Freight", "owner@example.com", "Own", "Er", UserRole.SHIPPER, "reason");

        mockMvc.perform(post("/api/v1/super-user/tenants").with(tenantAdmin("tenant-admin-1"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());

        verifyNoInteractions(superUserProvisioningService);
    }
}
