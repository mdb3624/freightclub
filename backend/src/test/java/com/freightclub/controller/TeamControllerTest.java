package com.freightclub.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.freightclub.dto.JoinCodeResponse;
import com.freightclub.dto.SetTenantAdminRequest;
import com.freightclub.dto.TeamMemberResponse;
import com.freightclub.service.TeamService;
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

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// US-875/877 AC-5: 403 for a non-admin persona user, regardless of persona. Both Shipper and
// Carrier admins share this one controller (ROLE_TENANT_ADMIN gate, per US-874), so one test
// class exercises both stories' security ACs instead of duplicating a second controller test.
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TeamControllerTest {

    @MockBean private TeamService teamService;

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    private static RequestPostProcessor shipperAdmin(String id) {
        return authentication(new UsernamePasswordAuthenticationToken(
                id, null, List.of(new SimpleGrantedAuthority("ROLE_SHIPPER"), new SimpleGrantedAuthority("ROLE_TENANT_ADMIN"))));
    }

    private static RequestPostProcessor carrierAdmin(String id) {
        return authentication(new UsernamePasswordAuthenticationToken(
                id, null, List.of(new SimpleGrantedAuthority("ROLE_TRUCKER"), new SimpleGrantedAuthority("ROLE_TENANT_ADMIN"))));
    }

    private static RequestPostProcessor plainShipper(String id) {
        return authentication(new UsernamePasswordAuthenticationToken(
                id, null, List.of(new SimpleGrantedAuthority("ROLE_SHIPPER"))));
    }

    private static RequestPostProcessor plainTrucker(String id) {
        return authentication(new UsernamePasswordAuthenticationToken(
                id, null, List.of(new SimpleGrantedAuthority("ROLE_TRUCKER"))));
    }

    @Test
    void listMembers_ok_forShipperAdmin() throws Exception {
        when(teamService.listMembers("admin-1")).thenReturn(List.of(
                new TeamMemberResponse("admin-1", "a@x.com", "A", "Admin", true, LocalDateTime.now())
        ));

        mockMvc.perform(get("/api/v1/team/members").with(shipperAdmin("admin-1")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].isTenantAdmin").value(true));
    }

    @Test
    void listMembers_ok_forCarrierAdmin() throws Exception {
        when(teamService.listMembers("admin-1")).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/team/members").with(carrierAdmin("admin-1")))
                .andExpect(status().isOk());
    }

    @Test
    void listMembers_forbidden_forPlainShipper() throws Exception {
        mockMvc.perform(get("/api/v1/team/members").with(plainShipper("shipper-1")))
                .andExpect(status().isForbidden());

        verify(teamService, never()).listMembers(any());
    }

    @Test
    void listMembers_forbidden_forPlainTrucker() throws Exception {
        mockMvc.perform(get("/api/v1/team/members").with(plainTrucker("trucker-1")))
                .andExpect(status().isForbidden());

        verify(teamService, never()).listMembers(any());
    }

    @Test
    void getJoinCode_ok_forAdmin() throws Exception {
        when(teamService.getJoinCode("admin-1")).thenReturn(new JoinCodeResponse("ABCD1234"));

        mockMvc.perform(get("/api/v1/team/join-code").with(shipperAdmin("admin-1")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.joinCode").value("ABCD1234"));
    }

    @Test
    void removeMember_noContent_forAdmin() throws Exception {
        mockMvc.perform(delete("/api/v1/team/members/member-1").with(shipperAdmin("admin-1")))
                .andExpect(status().isNoContent());

        verify(teamService).removeMember("admin-1", "member-1");
    }

    @Test
    void removeMember_forbidden_forPlainMember() throws Exception {
        mockMvc.perform(delete("/api/v1/team/members/member-1").with(plainShipper("shipper-1")))
                .andExpect(status().isForbidden());

        verify(teamService, never()).removeMember(any(), any());
    }

    @Test
    void setAdminStatus_noContent_forAdmin() throws Exception {
        mockMvc.perform(patch("/api/v1/team/members/member-1/admin-status")
                        .with(carrierAdmin("admin-1"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SetTenantAdminRequest(true))))
                .andExpect(status().isNoContent());

        verify(teamService).setTenantAdminStatus("admin-1", "member-1", true);
    }
}
