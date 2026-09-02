package com.freightclub.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.freightclub.dto.OrgSettingsResponse;
import com.freightclub.dto.UpdateOrgSettingsRequest;
import com.freightclub.service.OrgSettingsService;
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

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// US-876/878 AC-5: same ROLE_TENANT_ADMIN gate as TeamController, shared across both stories.
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class OrgSettingsControllerTest {

    @MockBean private OrgSettingsService orgSettingsService;

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    private static RequestPostProcessor tenantAdmin(String id) {
        return authentication(new UsernamePasswordAuthenticationToken(
                id, null, List.of(new SimpleGrantedAuthority("ROLE_SHIPPER"), new SimpleGrantedAuthority("ROLE_TENANT_ADMIN"))));
    }

    private static RequestPostProcessor plainMember(String id) {
        return authentication(new UsernamePasswordAuthenticationToken(
                id, null, List.of(new SimpleGrantedAuthority("ROLE_SHIPPER"))));
    }

    @Test
    void getOrgSettings_ok_forAdmin() throws Exception {
        when(orgSettingsService.getOrgSettings("admin-1")).thenReturn(new OrgSettingsResponse(
                "123 Main St", null, null, null, null,
                null, null, null, null, null,
                null, null, null, null,
                true, null, null, 1L
        ));

        mockMvc.perform(get("/api/v1/team/org-settings").with(tenantAdmin("admin-1")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.defaultPickupAddress1").value("123 Main St"))
                .andExpect(jsonPath("$.memberCount").value(1));
    }

    @Test
    void getOrgSettings_forbidden_forPlainMember() throws Exception {
        mockMvc.perform(get("/api/v1/team/org-settings").with(plainMember("member-1")))
                .andExpect(status().isForbidden());

        verify(orgSettingsService, never()).getOrgSettings(any());
    }

    @Test
    void updateOrgSettings_noContent_forAdmin() throws Exception {
        UpdateOrgSettingsRequest request = new UpdateOrgSettingsRequest(
                null, null, "New City", null, null,
                null, null, null, null, null,
                new BigDecimal("3.75"), null, null, null,
                null, null, null
        );

        mockMvc.perform(put("/api/v1/team/org-settings")
                        .with(tenantAdmin("admin-1"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNoContent());

        verify(orgSettingsService).updateOrgSettings(eq("admin-1"), any());
    }
}
