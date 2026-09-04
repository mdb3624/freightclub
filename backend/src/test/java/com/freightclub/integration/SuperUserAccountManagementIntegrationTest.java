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

// US-881: real end-to-end proof, not mocked — a Super User suspending a real registered user
// actually blocks their login, reactivating actually restores it, and a forced password reset
// actually invalidates the old password and lets the user set a new one via the redeemed token.
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SuperUserAccountManagementIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    private String registerShipperAndGetUserId(String email) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RegisterRequest(
                                email, "Password1!", "Test", "User", UserRole.SHIPPER,
                                "Suspend Test Co " + UUID.randomUUID(), null, null, null, null))))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("user").get("id").asText();
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
    void suspend_blocksLogin_reactivate_restoresIt() throws Exception {
        String shipperEmail = "suspend-target-" + UUID.randomUUID() + "@example.com";
        String userId = registerShipperAndGetUserId(shipperEmail);
        String superUserToken = loginAsSuperUserAndGetAccessToken();

        // Super User suspends the shipper
        mockMvc.perform(post("/api/v1/super-user/users/" + userId + "/suspend")
                        .header("Authorization", "Bearer " + superUserToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SuperUserActionRequest("Reported for fraud"))))
                .andExpect(status().isNoContent());

        // Suspended user cannot log in — clear 403, not generic invalid-credentials
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(shipperEmail, "Password1!"))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("This account has been suspended"));

        // Reactivate
        mockMvc.perform(post("/api/v1/super-user/users/" + userId + "/reactivate")
                        .header("Authorization", "Bearer " + superUserToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SuperUserActionRequest("Investigation cleared"))))
                .andExpect(status().isNoContent());

        // Can log in again
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(shipperEmail, "Password1!"))))
                .andExpect(status().isOk());
    }

    @Test
    void suspend_rejectsSelfSuspend() throws Exception {
        String email = "self-suspend-" + UUID.randomUUID() + "@freightclub.local";
        mockMvc.perform(post("/api/test/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RegisterRequest(
                                email, "Password1!", "Sam", "SuperUser", UserRole.ADMIN,
                                "n-a-" + UUID.randomUUID(), null, null, null, null))))
                .andExpect(status().isOk());
        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(email, "Password1!"))))
                .andReturn();
        String accessToken = objectMapper.readTree(loginResult.getResponse().getContentAsString()).get("accessToken").asText();
        String selfId = objectMapper.readTree(loginResult.getResponse().getContentAsString()).get("user").get("id").asText();

        mockMvc.perform(post("/api/v1/super-user/users/" + selfId + "/suspend")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SuperUserActionRequest("oops"))))
                .andExpect(status().isConflict());
    }

    @Test
    void forcePasswordReset_invalidatesOldPassword_tokenRedeemSetsNewOne() throws Exception {
        String shipperEmail = "reset-target-" + UUID.randomUUID() + "@example.com";
        String userId = registerShipperAndGetUserId(shipperEmail);
        String superUserToken = loginAsSuperUserAndGetAccessToken();

        MvcResult resetResult = mockMvc.perform(post("/api/v1/super-user/users/" + userId + "/force-password-reset")
                        .header("Authorization", "Bearer " + superUserToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SuperUserActionRequest("Suspected compromise"))))
                .andExpect(status().isOk())
                .andReturn();
        String resetToken = objectMapper.readTree(resetResult.getResponse().getContentAsString()).get("resetToken").asText();

        // Old password no longer works
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(shipperEmail, "Password1!"))))
                .andExpect(status().isUnauthorized());

        // Redeem the token to set a new password
        mockMvc.perform(post("/api/v1/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\":\"" + resetToken + "\",\"newPassword\":\"BrandNewPassword1!\"}"))
                .andExpect(status().isNoContent());

        // New password works
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(shipperEmail, "BrandNewPassword1!"))))
                .andExpect(status().isOk());
    }
}
