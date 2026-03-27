package com.freightclub.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.freightclub.domain.UserRole;
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

import static org.assertj.core.api.Assertions.assertThat;
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
        // 1. Register
        MvcResult registerResult = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(shipperRequest("roundtrip@example.com"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.user.email").value("roundtrip@example.com"))
                .andExpect(header().exists("Set-Cookie"))
                .andReturn();

        String setCookieHeader = registerResult.getResponse().getHeader("Set-Cookie");
        assertThat(setCookieHeader).contains("refreshToken=");

        // 2. Login with same credentials
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new LoginRequest("roundtrip@example.com", "Password1!"))))
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
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(shipperRequest("duplicate@example.com"))))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(shipperRequest("duplicate@example.com"))))
                .andExpect(status().isConflict());
    }

    @Test
    void login_badCredentials_returns401() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new LoginRequest("nobody@example.com", "wrongpass"))))
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
