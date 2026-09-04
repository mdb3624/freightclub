package com.freightclub.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.freightclub.domain.UserRole;
import com.freightclub.dto.CreateTenantWithFirstUserRequest;
import com.freightclub.dto.CreateUserInTenantRequest;
import com.freightclub.dto.LoginRequest;
import com.freightclub.dto.RegisterRequest;
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

// US-886: real end-to-end proof of the raw-SQL creation paths (existing-tenant add, new-tenant
// creation) — a wrong column list or missing NOT NULL value would only surface against a real
// database, not mocks (this exact class of bug already caught once in US-880's audit-log FK
// constraint).
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SuperUserProvisioningIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

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
    void createTenantWithFirstUser_thenRedeemSetupToken_thenLoginWorks() throws Exception {
        String superUserToken = loginAsSuperUserAndGetAccessToken();
        String newOwnerEmail = "new-owner-" + UUID.randomUUID() + "@example.com";

        MvcResult createResult = mockMvc.perform(post("/api/v1/super-user/tenants")
                        .header("Authorization", "Bearer " + superUserToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateTenantWithFirstUserRequest(
                                "New Co " + UUID.randomUUID(), newOwnerEmail, "New", "Owner", UserRole.SHIPPER, "Phone signup"))))
                .andExpect(status().isOk())
                .andReturn();
        String setupToken = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("setupToken").asText();

        // No working password exists yet
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(newOwnerEmail, "anything"))))
                .andExpect(status().isUnauthorized());

        // Redeem the setup token
        mockMvc.perform(post("/api/v1/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\":\"" + setupToken + "\",\"newPassword\":\"MyChosenPassword1!\"}"))
                .andExpect(status().isNoContent());

        // Now login works
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(newOwnerEmail, "MyChosenPassword1!"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.isTenantAdmin").value(true));
    }

    @Test
    void createUserInExistingTenant_addsRealMemberToRealTenant() throws Exception {
        String superUserToken = loginAsSuperUserAndGetAccessToken();

        // Create the tenant first via the same endpoint
        String ownerEmail = "owner-" + UUID.randomUUID() + "@example.com";
        MvcResult tenantResult = mockMvc.perform(post("/api/v1/super-user/tenants")
                        .header("Authorization", "Bearer " + superUserToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateTenantWithFirstUserRequest(
                                "Existing Co " + UUID.randomUUID(), ownerEmail, "Owner", "One", UserRole.TRUCKER, "setup"))))
                .andExpect(status().isOk())
                .andReturn();

        // Need the tenantId — redeem the owner's token first to fetch their user record via login
        String ownerToken = objectMapper.readTree(tenantResult.getResponse().getContentAsString()).get("setupToken").asText();
        mockMvc.perform(post("/api/v1/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\":\"" + ownerToken + "\",\"newPassword\":\"OwnerPassword1!\"}"))
                .andExpect(status().isNoContent());
        MvcResult ownerLogin = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(ownerEmail, "OwnerPassword1!"))))
                .andReturn();
        String tenantId = objectMapper.readTree(ownerLogin.getResponse().getContentAsString()).get("user").get("tenantId").asText();

        // Now add a teammate to that same tenant
        String teammateEmail = "teammate-" + UUID.randomUUID() + "@example.com";
        mockMvc.perform(post("/api/v1/super-user/users")
                        .header("Authorization", "Bearer " + superUserToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateUserInTenantRequest(
                                tenantId, teammateEmail, "Team", "Mate", UserRole.TRUCKER, "Customer requested teammate"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.setupToken").isNotEmpty());
    }
}
