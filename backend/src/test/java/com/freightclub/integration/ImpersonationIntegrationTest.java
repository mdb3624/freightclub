package com.freightclub.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.freightclub.domain.UserRole;
import com.freightclub.dto.EndImpersonationRequest;
import com.freightclub.dto.LoginRequest;
import com.freightclub.dto.RegisterRequest;
import com.freightclub.dto.StartImpersonationRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// US-885: real end-to-end proof — a Super User can start a view-only impersonation session of a
// real registered user with re-authentication, the resulting token reads as that user but
// cannot write, and ending the session works from inside the impersonated session itself.
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ImpersonationIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    private record SuperUserSession(String accessToken) {}

    private String registerShipperAndGetUserId(String email) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RegisterRequest(
                                email, "Password1!", "Test", "User", UserRole.SHIPPER,
                                "Impersonation Test Co " + UUID.randomUUID(), null, null, null, null))))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("user").get("id").asText();
    }

    private SuperUserSession registerSuperUserAndLogin(String email, String password) throws Exception {
        mockMvc.perform(post("/api/test/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RegisterRequest(
                                email, password, "Sam", "SuperUser", UserRole.ADMIN,
                                "n-a-" + UUID.randomUUID(), null, null, null, null))))
                .andExpect(status().isOk());
        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(email, password))))
                .andExpect(status().isOk())
                .andReturn();
        return new SuperUserSession(objectMapper.readTree(loginResult.getResponse().getContentAsString()).get("accessToken").asText());
    }

    @Test
    void start_issuesViewOnlyToken_blocksWrites_allowsEnd() throws Exception {
        String shipperEmail = "impersonation-target-" + UUID.randomUUID() + "@example.com";
        String targetUserId = registerShipperAndGetUserId(shipperEmail);
        String superUserEmail = "super-user-" + UUID.randomUUID() + "@freightclub.local";
        SuperUserSession superUser = registerSuperUserAndLogin(superUserEmail, "Password1!");

        MvcResult startResult = mockMvc.perform(post("/api/v1/super-user/impersonation/start")
                        .header("Authorization", "Bearer " + superUser.accessToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new StartImpersonationRequest(targetUserId, "Support ticket #99", "Password1!"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.target.email").value(shipperEmail))
                .andReturn();

        var startJson = objectMapper.readTree(startResult.getResponse().getContentAsString());
        String impersonationToken = startJson.get("impersonationToken").asText();
        String sessionId = startJson.get("sessionId").asText();

        // A read (GET) works while impersonating.
        mockMvc.perform(get("/api/v1/loads").header("Authorization", "Bearer " + impersonationToken))
                .andExpect(status().is2xxSuccessful());

        // A write is blocked — view-only by default (BR-4's safer v1 default). Rejected by
        // JwtAuthenticationFilter itself (response.sendError, before Spring MVC dispatch), so
        // the body goes through Spring Boot's default /error handling, not GlobalExceptionHandler's
        // custom ErrorResponse shape — only the status is asserted here.
        mockMvc.perform(post("/api/v1/loads").header("Authorization", "Bearer " + impersonationToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());

        // The one-click end control (itself a POST) is the explicit exception.
        mockMvc.perform(post("/api/v1/super-user/impersonation/end")
                        .header("Authorization", "Bearer " + impersonationToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new EndImpersonationRequest(sessionId))))
                .andExpect(status().isNoContent());
    }

    @Test
    void start_rejectsInvalidReauthentication() throws Exception {
        String targetUserId = registerShipperAndGetUserId("reauth-target-" + UUID.randomUUID() + "@example.com");
        SuperUserSession superUser = registerSuperUserAndLogin("super-user-" + UUID.randomUUID() + "@freightclub.local", "Password1!");

        mockMvc.perform(post("/api/v1/super-user/impersonation/start")
                        .header("Authorization", "Bearer " + superUser.accessToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new StartImpersonationRequest(targetUserId, "reason", "WrongPassword1!"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void start_rejectsImpersonatingAnotherAdmin() throws Exception {
        SuperUserSession actor = registerSuperUserAndLogin("actor-" + UUID.randomUUID() + "@freightclub.local", "Password1!");
        MvcResult otherAdminReg = mockMvc.perform(post("/api/test/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RegisterRequest(
                                "other-admin-" + UUID.randomUUID() + "@freightclub.local", "Password1!", "Other", "Admin",
                                UserRole.ADMIN, "n-a-" + UUID.randomUUID(), null, null, null, null))))
                .andExpect(status().isOk())
                .andReturn();
        String otherAdminId = objectMapper.readTree(otherAdminReg.getResponse().getContentAsString()).get("user").get("id").asText();

        mockMvc.perform(post("/api/v1/super-user/impersonation/start")
                        .header("Authorization", "Bearer " + actor.accessToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new StartImpersonationRequest(otherAdminId, "reason", "Password1!"))))
                .andExpect(status().isForbidden());
    }
}
