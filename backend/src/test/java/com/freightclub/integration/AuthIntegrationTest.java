package com.freightclub.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.freightclub.domain.UserRole;
import com.freightclub.dto.LoginRequest;
import com.freightclub.dto.RegisterRequest;
import org.junit.jupiter.api.Test;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    private RegisterRequest shipperRequest(String email) {
        return new RegisterRequest(
                email, "Password1!",
                "Integration", "Test",
                UserRole.SHIPPER,
                "Integration Corp", null,
                null, null, null
        );
    }

    @Test
    void register_login_refresh_logout_fullRoundTrip() throws Exception {
        String email = "roundtrip-" + UUID.randomUUID() + "@example.com";
        // 1. Register
        MvcResult registerResult = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(shipperRequest(email))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.user.email").value(email))
                .andExpect(header().exists("Set-Cookie"))
                .andReturn();

        String setCookieHeader = registerResult.getResponse().getHeader("Set-Cookie");
        assertThat(setCookieHeader).contains("refreshToken=");

        // 2. Login with same credentials
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new LoginRequest(email, "Password1!"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(header().exists("Set-Cookie"));

        // 3. Refresh using cookie from register
        String rawToken = extractRefreshToken(setCookieHeader);
        mockMvc.perform(post("/api/v1/auth/refresh")
                        .cookie(new jakarta.servlet.http.Cookie("refreshToken", rawToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(header().exists("Set-Cookie"));

        // 4. Logout
        mockMvc.perform(post("/api/v1/auth/logout"))
                .andExpect(status().isNoContent());
    }

    @Test
    void register_duplicateEmail_returns409() throws Exception {
        String email = "duplicate-" + UUID.randomUUID() + "@example.com";
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(shipperRequest(email))))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(shipperRequest(email))))
                .andExpect(status().isConflict());
    }

    /**
     * Regression: JwtAuthenticationFilter was registered both as @Component (servlet chain)
     * AND via addFilterBefore (security chain). SecurityContextHolderFilter cleared the auth
     * set by the pre-chain filter, causing all protected endpoints to return 401 even with a
     * valid token. This test catches that regression by performing a real login and then
     * accessing a protected endpoint with the returned token.
     */
    @Test
    void login_withValidCredentials_canAccessProtectedEndpoint() throws Exception {
        String email = "protected-" + UUID.randomUUID() + "@example.com";
        // Register and capture access token
        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(shipperRequest(email))))
                .andExpect(status().isCreated())
                .andReturn();

        String accessToken = objectMapper.readTree(loginResult.getResponse().getContentAsString())
                .get("accessToken").asText();

        // A valid token MUST be able to access a ROLE_SHIPPER protected endpoint (not 401/403)
        mockMvc.perform(get("/api/v1/loads")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk());
    }

    @Test
    void login_badCredentials_returns401() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new LoginRequest("nobody@example.com", "wrongpass"))))
                .andExpect(status().isUnauthorized());
    }

    /**
     * Regression: DELETE /api/test/auth/users/{id} 500'd on every call once
     * freightclub_runtime lost BYPASSRLS (US-857). deleteTestUser's findById() and save()
     * ran as two separate Spring-managed transactions sharing one OSIV connection; SET LOCAL
     * app.current_tenant (transaction-scoped) applied for the first transaction and was reset
     * at its commit, so the second transaction's UPDATE ran with no tenant context, RLS's
     * fail-closed policy filtered the row to zero matches, and Hibernate raised
     * StaleObjectStateException. This test proves the delete actually persists (not just
     * returns 204) by confirming the user can no longer log in afterward.
     */
    @Test
    void deleteTestUser_softDeletesUser_loginFailsAfterward() throws Exception {
        String email = "delete-test-user-" + UUID.randomUUID() + "@example.com";
        MvcResult registerResult = mockMvc.perform(post("/api/test/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(java.util.Map.of(
                                "email", email,
                                "password", "Password1!",
                                "firstName", "Delete",
                                "lastName", "Target",
                                "role", "SHIPPER",
                                "companyName", "Delete Target Co"))))
                .andExpect(status().isOk())
                .andReturn();

        String userId = objectMapper.readTree(registerResult.getResponse().getContentAsString())
                .get("user").get("id").asText();

        mockMvc.perform(delete("/api/test/auth/users/" + userId))
                .andExpect(status().isNoContent());

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(email, "Password1!"))))
                .andExpect(status().isUnauthorized());
    }

    private String extractRefreshToken(String setCookieHeader) {
        // Format: "refreshToken=<value>; HttpOnly; ..."
        String[] parts = setCookieHeader.split(";");
        for (String part : parts) {
            part = part.trim();
            if (part.startsWith("refreshToken=")) {
                return part.substring("refreshToken=".length());
            }
        }
        throw new IllegalStateException("refreshToken not found in Set-Cookie: " + setCookieHeader);
    }
}
