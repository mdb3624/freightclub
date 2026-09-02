package com.freightclub.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.freightclub.domain.DisputeOutcome;
import com.freightclub.dto.DisputeQueueItemResponse;
import com.freightclub.dto.ResolveDisputeRequest;
import com.freightclub.service.DisputeResolutionService;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// US-751 AC-2: 403 for a non-ADMIN user, regardless of persona or tenant-admin status.
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class DisputeResolutionControllerTest {

    @MockBean private DisputeResolutionService disputeResolutionService;

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
    void listOpenDisputes_ok_forSuperUser() throws Exception {
        when(disputeResolutionService.listOpenDisputes()).thenReturn(List.of(
                new DisputeQueueItemResponse("d-1", "load-1", "Acme", "s@x.com", "damaged", "OPEN", LocalDateTime.now())));

        mockMvc.perform(get("/api/v1/super-user/disputes").with(superUser("admin-1")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].tenantName").value("Acme"));
    }

    @Test
    void listOpenDisputes_forbidden_forTenantAdmin() throws Exception {
        mockMvc.perform(get("/api/v1/super-user/disputes").with(tenantAdmin("tenant-admin-1")))
                .andExpect(status().isForbidden());

        verify(disputeResolutionService, never()).listOpenDisputes();
    }

    @Test
    void resolveDispute_noContent_forSuperUser() throws Exception {
        ResolveDisputeRequest request = new ResolveDisputeRequest(DisputeOutcome.RESOLVED_CARRIER_FAVOR, "Shipper confirmed delay was their fault");

        mockMvc.perform(post("/api/v1/super-user/disputes/d-1/resolve").with(superUser("admin-1"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNoContent());

        verify(disputeResolutionService).resolveDispute(eq("admin-1"), eq("d-1"), any());
    }

    @Test
    void resolveDispute_badRequest_whenReasonBlank() throws Exception {
        String body = "{\"outcome\":\"NO_ACTION_NEEDED\",\"reason\":\"\"}";

        mockMvc.perform(post("/api/v1/super-user/disputes/d-1/resolve").with(superUser("admin-1"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }
}
