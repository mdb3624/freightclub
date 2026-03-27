package com.freightclub.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.freightclub.domain.User;
import com.freightclub.domain.UserRole;
import com.freightclub.dto.LoginRequest;
import com.freightclub.dto.RegisterRequest;
import com.freightclub.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.lang.reflect.Field;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

    @MockBean private AuthService authService;

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    private User makeUser(String id, String email) {
        User user = new User();
        setField(user, "id", id);
        user.setEmail(email);
        user.setFirstName("Test");
        user.setLastName("User");
        user.setRole(UserRole.SHIPPER);
        user.setTenantId("tenant-1");
        return user;
    }

    private static void setField(Object target, String name, Object value) {
        try {
            Field f = target.getClass().getDeclaredField(name);
            f.setAccessible(true);
            f.set(target, value);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    void register_returns201WithTokenAndCookie() throws Exception {
        User user = makeUser("user-1", "test@example.com");
        when(authService.register(any())).thenReturn(
                new AuthService.AuthResult("access-token", "refresh-token", user));
        when(authService.accessTokenExpirySeconds()).thenReturn(900L);

        RegisterRequest req = new RegisterRequest(
                "test@example.com", "password123",
                "Test", "User", UserRole.SHIPPER,
                "Test Corp", null, null, null, null);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").value("access-token"))
                .andExpect(jsonPath("$.user.email").value("test@example.com"))
                .andExpect(header().exists("Set-Cookie"));
    }

    @Test
    void login_returns200WithTokenAndCookie() throws Exception {
        User user = makeUser("user-1", "login@example.com");
        when(authService.login(any())).thenReturn(
                new AuthService.AuthResult("login-access-token", "login-refresh", user));
        when(authService.accessTokenExpirySeconds()).thenReturn(900L);

        LoginRequest req = new LoginRequest("login@example.com", "password123");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("login-access-token"))
                .andExpect(header().exists("Set-Cookie"));
    }

    @Test
    void refresh_returns401WhenNoCookie() throws Exception {
        mockMvc.perform(post("/api/v1/auth/refresh"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void refresh_returns200WithNewTokenWhenCookiePresent() throws Exception {
        when(authService.refresh(anyString())).thenReturn(
                new AuthService.RefreshResult("new-access-token", "new-refresh-token"));
        when(authService.accessTokenExpirySeconds()).thenReturn(900L);

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .cookie(new jakarta.servlet.http.Cookie("refreshToken", "old-refresh")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("new-access-token"))
                .andExpect(header().exists("Set-Cookie"));
    }

    @Test
    void logout_returns204AndClearsRefreshCookie() throws Exception {
        mockMvc.perform(post("/api/v1/auth/logout"))
                .andExpect(status().isNoContent())
                .andExpect(header().exists("Set-Cookie"));
    }
}
