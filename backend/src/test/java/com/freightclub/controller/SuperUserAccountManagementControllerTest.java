package com.freightclub.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.freightclub.dto.ActivityEventResponse;
import com.freightclub.dto.SuperUserActionRequest;
import com.freightclub.service.SuperUserAccountManagementService;
import com.freightclub.service.SuperUserActivityService;
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

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SuperUserAccountManagementControllerTest {

    @MockBean private SuperUserAccountManagementService superUserAccountManagementService;
    @MockBean private SuperUserActivityService superUserActivityService;

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
    void suspend_noContent_forSuperUser() throws Exception {
        mockMvc.perform(post("/api/v1/super-user/users/user-1/suspend").with(superUser("admin-1"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SuperUserActionRequest("Fraud report"))))
                .andExpect(status().isNoContent());

        verify(superUserAccountManagementService).suspendUser(eq("admin-1"), eq("user-1"), eq("Fraud report"));
    }

    @Test
    void suspend_badRequest_whenReasonBlank() throws Exception {
        mockMvc.perform(post("/api/v1/super-user/users/user-1/suspend").with(superUser("admin-1"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"reason\":\"\"}"))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(superUserAccountManagementService);
    }

    @Test
    void suspend_forbidden_forTenantAdmin() throws Exception {
        mockMvc.perform(post("/api/v1/super-user/users/user-1/suspend").with(tenantAdmin("tenant-admin-1"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SuperUserActionRequest("reason"))))
                .andExpect(status().isForbidden());

        verifyNoInteractions(superUserAccountManagementService);
    }

    @Test
    void reactivate_noContent_forSuperUser() throws Exception {
        mockMvc.perform(post("/api/v1/super-user/users/user-1/reactivate").with(superUser("admin-1"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SuperUserActionRequest("Cleared"))))
                .andExpect(status().isNoContent());

        verify(superUserAccountManagementService).reactivateUser(eq("admin-1"), eq("user-1"), eq("Cleared"));
    }

    @Test
    void forcePasswordReset_returnsToken_forSuperUser() throws Exception {
        when(superUserAccountManagementService.forcePasswordReset("admin-1", "user-1", "Suspected compromise"))
                .thenReturn("raw-reset-token");

        mockMvc.perform(post("/api/v1/super-user/users/user-1/force-password-reset").with(superUser("admin-1"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SuperUserActionRequest("Suspected compromise"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.resetToken").value("raw-reset-token"));
    }

    @Test
    void activity_ok_forSuperUser() throws Exception {
        when(superUserActivityService.getActivity("user-1")).thenReturn(List.of(
                new ActivityEventResponse("LOGIN", "Logged in", LocalDateTime.now())));

        mockMvc.perform(get("/api/v1/super-user/users/user-1/activity").with(superUser("admin-1")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].eventType").value("LOGIN"));
    }

    @Test
    void activity_forbidden_forTenantAdmin() throws Exception {
        mockMvc.perform(get("/api/v1/super-user/users/user-1/activity").with(tenantAdmin("tenant-admin-1")))
                .andExpect(status().isForbidden());

        verifyNoInteractions(superUserActivityService);
    }
}
