package com.freightclub.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.freightclub.dto.EndImpersonationRequest;
import com.freightclub.dto.ImpersonationStartResponse;
import com.freightclub.dto.StartImpersonationRequest;
import com.freightclub.dto.TargetUserSummary;
import com.freightclub.security.ImpersonationContextHolder;
import com.freightclub.service.ImpersonationService;
import org.junit.jupiter.api.AfterEach;
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

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ImpersonationControllerTest {

    @MockBean private ImpersonationService impersonationService;

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @AfterEach
    void clearContext() {
        ImpersonationContextHolder.clear();
    }

    private static RequestPostProcessor superUser(String id) {
        return authentication(new UsernamePasswordAuthenticationToken(
                id, null, List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))));
    }

    private static RequestPostProcessor tenantAdmin(String id) {
        return authentication(new UsernamePasswordAuthenticationToken(
                id, null, List.of(new SimpleGrantedAuthority("ROLE_SHIPPER"), new SimpleGrantedAuthority("ROLE_TENANT_ADMIN"))));
    }

    @Test
    void start_returnsToken_forSuperUser() throws Exception {
        StartImpersonationRequest request = new StartImpersonationRequest("target-1", "Support ticket #42", "password");
        ImpersonationStartResponse response = new ImpersonationStartResponse(
                "impersonation-jwt", "session-1", Instant.parse("2026-09-02T12:15:00Z"),
                new TargetUserSummary("target-1", "s@example.com", "S", "User", "SHIPPER"));
        when(impersonationService.start("admin-1", "target-1", "Support ticket #42", "password")).thenReturn(response);

        mockMvc.perform(post("/api/v1/super-user/impersonation/start").with(superUser("admin-1"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.impersonationToken").value("impersonation-jwt"))
                .andExpect(jsonPath("$.target.email").value("s@example.com"));
    }

    @Test
    void start_forbidden_forNonSuperUser() throws Exception {
        StartImpersonationRequest request = new StartImpersonationRequest("target-1", "reason", "password");

        mockMvc.perform(post("/api/v1/super-user/impersonation/start").with(tenantAdmin("tenant-admin-1"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());

        verifyNoInteractions(impersonationService);
    }

    @Test
    void start_badRequest_whenReasonBlank() throws Exception {
        mockMvc.perform(post("/api/v1/super-user/impersonation/start").with(superUser("admin-1"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"targetUserId\":\"target-1\",\"reason\":\"\",\"password\":\"pw\"}"))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(impersonationService);
    }

    // BR-2: the end-impersonation control is authorized by an active impersonation context
    // (bound by JwtAuthenticationFilter from the impersonation token's own claims), not a role —
    // MockMvc runs synchronously on the test thread, so binding the ThreadLocal directly here
    // stands in for what the filter would otherwise do.
    @Test
    void end_noContent_whenImpersonationContextActive() throws Exception {
        ImpersonationContextHolder.set("admin-1", "session-1");

        mockMvc.perform(post("/api/v1/super-user/impersonation/end").with(tenantAdmin("target-1"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new EndImpersonationRequest("session-1"))))
                .andExpect(status().isNoContent());

        verify(impersonationService).end("admin-1", "session-1");
    }

    @Test
    void end_forbidden_whenNoImpersonationContextActive() throws Exception {
        mockMvc.perform(post("/api/v1/super-user/impersonation/end").with(tenantAdmin("target-1"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new EndImpersonationRequest("session-1"))))
                .andExpect(status().isForbidden());

        verifyNoInteractions(impersonationService);
    }
}
