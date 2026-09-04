package com.freightclub.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.freightclub.domain.UserRole;
import com.freightclub.dto.LoginRequest;
import com.freightclub.dto.RegisterRequest;
import com.freightclub.dto.SuperUserActionRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// US-884: real end-to-end proof — suspending a tenant actually blocks login for every user in
// it (BR-1), independent of any individual user's own is_suspended flag, and reactivating
// actually restores it.
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SuperUserTenantManagementIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    private String registerShipperAndGetTenantId(String email) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RegisterRequest(
                                email, "Password1!", "Test", "User", UserRole.SHIPPER,
                                "Tenant Suspend Test Co " + UUID.randomUUID(), null, null, null, null))))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("user").get("tenantId").asText();
    }

    private String loginAsSuperUserAndGetAccessToken() throws Exception {
        String email = "super-user-" + UUID.randomUUID() + "@freightclub.local";
        mockMvc.perform(post("/api/test/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RegisterRequest(
                                email, "Password1!", "Sam", "SuperUser", UserRole.ADMIN,
                                "n-a-" + UUID.randomUUID(), null, null, null, null))))
                .andExpect(status().isOk());
        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(email, "Password1!"))))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readTree(loginResult.getResponse().getContentAsString()).get("accessToken").asText();
    }

    @Test
    void suspendTenant_blocksLogin_reactivate_restoresIt() throws Exception {
        String shipperEmail = "tenant-suspend-target-" + UUID.randomUUID() + "@example.com";
        String tenantId = registerShipperAndGetTenantId(shipperEmail);
        String superUserToken = loginAsSuperUserAndGetAccessToken();

        mockMvc.perform(post("/api/v1/super-user/tenants/" + tenantId + "/suspend")
                        .header("Authorization", "Bearer " + superUserToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SuperUserActionRequest("Non-payment"))))
                .andExpect(status().isNoContent());

        // Every user in a suspended tenant is blocked, with a clear message (AC-2) — not the
        // user-level "This account has been suspended" message, since that flag was never set.
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(shipperEmail, "Password1!"))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("This organization's account has been suspended"));

        mockMvc.perform(post("/api/v1/super-user/tenants/" + tenantId + "/reactivate")
                        .header("Authorization", "Bearer " + superUserToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SuperUserActionRequest("Payment received"))))
                .andExpect(status().isNoContent());

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(shipperEmail, "Password1!"))))
                .andExpect(status().isOk());
    }

    @Test
    void suspendTenant_rejectsBlankReason() throws Exception {
        String tenantId = registerShipperAndGetTenantId("blank-reason-" + UUID.randomUUID() + "@example.com");
        String superUserToken = loginAsSuperUserAndGetAccessToken();

        mockMvc.perform(post("/api/v1/super-user/tenants/" + tenantId + "/suspend")
                        .header("Authorization", "Bearer " + superUserToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"reason\":\"\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void suspendTenant_forbidden_forNonSuperUser() throws Exception {
        String shipperEmail = "non-admin-actor-" + UUID.randomUUID() + "@example.com";
        String tenantId = registerShipperAndGetTenantId(shipperEmail);
        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(shipperEmail, "Password1!"))))
                .andExpect(status().isOk())
                .andReturn();
        String accessToken = objectMapper.readTree(loginResult.getResponse().getContentAsString()).get("accessToken").asText();

        mockMvc.perform(post("/api/v1/super-user/tenants/" + tenantId + "/suspend")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SuperUserActionRequest("reason"))))
                .andExpect(status().isForbidden());
    }
}
