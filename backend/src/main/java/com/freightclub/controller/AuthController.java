package com.freightclub.controller;

import com.freightclub.dto.*;
import com.freightclub.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private static final String REFRESH_COOKIE_NAME = "refreshToken";

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthService.AuthResult result = authService.register(request);
        ResponseCookie cookie = buildRefreshCookie(result.rawRefreshToken(), authService.accessTokenExpirySeconds() * 480);
        AuthResponse body = AuthResponse.of(
                result.accessToken(),
                authService.accessTokenExpirySeconds(),
                UserResponse.from(result.user())
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(body);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthService.AuthResult result = authService.login(request);
        ResponseCookie cookie = buildRefreshCookie(result.rawRefreshToken(), authService.accessTokenExpirySeconds() * 480);
        AuthResponse body = AuthResponse.of(
                result.accessToken(),
                authService.accessTokenExpirySeconds(),
                UserResponse.from(result.user())
        );
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(body);
    }

    @PostMapping("/refresh")
    public ResponseEntity<RefreshResponse> refresh(
            @CookieValue(name = REFRESH_COOKIE_NAME, required = false) String rawToken) {
        if (rawToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        AuthService.RefreshResult result = authService.refresh(rawToken);
        ResponseCookie cookie = buildRefreshCookie(result.rawRefreshToken(), authService.accessTokenExpirySeconds() * 480);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(RefreshResponse.of(result.accessToken(), authService.accessTokenExpirySeconds()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@AuthenticationPrincipal String userId) {
        authService.logout(userId);
        ResponseCookie expiredCookie = buildRefreshCookie("", 0);
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, expiredCookie.toString())
                .build();
    }

    private ResponseCookie buildRefreshCookie(String value, long maxAgeSeconds) {
        return ResponseCookie.from(REFRESH_COOKIE_NAME, value)
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/api/v1/auth")
                .maxAge(Duration.ofSeconds(maxAgeSeconds))
                .build();
    }
}
