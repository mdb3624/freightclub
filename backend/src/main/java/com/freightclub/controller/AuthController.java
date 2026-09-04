package com.freightclub.controller;

import com.freightclub.dto.*;
import com.freightclub.service.AuthService;
import com.freightclub.service.PasswordResetService;
import jakarta.annotation.security.PermitAll;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.Arrays;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private static final String REFRESH_COOKIE_NAME = "refreshToken";

    private final AuthService authService;
    private final PasswordResetService passwordResetService;
    private final boolean cookieSecure;

    public AuthController(AuthService authService,
                          PasswordResetService passwordResetService,
                          @Value("${app.cookie.secure:true}") boolean cookieSecure) {
        this.authService = authService;
        this.passwordResetService = passwordResetService;
        this.cookieSecure = cookieSecure;
    }

    @PermitAll
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        // Security fix (2026-09-03): this endpoint is unauthenticated (PermitAll) — without
        // this check, request.role() == ADMIN let anyone self-register as a platform Super
        // User with zero gating. ADMIN accounts must only come from an existing Super User's
        // Create User flow or the internal bootstrap runner, never this public boundary.
        if (request.role() == com.freightclub.domain.UserRole.ADMIN) {
            throw new com.freightclub.exception.AdminSelfRegistrationNotAllowedException();
        }
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

    @PermitAll
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

    @PermitAll
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

    @PermitAll
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@AuthenticationPrincipal String userId) {
        if (userId != null) {
            authService.logout(userId);
        }
        ResponseCookie expiredCookie = buildRefreshCookie("", 0);
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, expiredCookie.toString())
                .build();
    }

    // US-881 BR-4: public self-service redemption of a Super-User-issued reset token — the
    // user sets their own new password, never the Super User.
    @PermitAll
    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody RedeemPasswordResetTokenRequest request) {
        passwordResetService.redeem(request.token(), request.newPassword());
        return ResponseEntity.noContent().build();
    }

    @PermitAll
    @GetMapping("/debug/cookies")
    public ResponseEntity<Map<String, Object>> debugCookies(HttpServletRequest request) {
        Map<String, Object> debug = new java.util.HashMap<>();
        debug.put("cookies", Arrays.stream(request.getCookies() != null ? request.getCookies() : new jakarta.servlet.http.Cookie[0])
                .collect(java.util.stream.Collectors.toMap(jakarta.servlet.http.Cookie::getName, jakarta.servlet.http.Cookie::getValue)));
        debug.put("headers", java.util.Collections.list(request.getHeaderNames()).stream()
                .collect(java.util.stream.Collectors.toMap(h -> h, request::getHeader)));
        return ResponseEntity.ok(debug);
    }

    private ResponseCookie buildRefreshCookie(String value, long maxAgeSeconds) {
        return ResponseCookie.from(REFRESH_COOKIE_NAME, value)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(cookieSecure ? "Strict" : "Lax")
                .path("/")
                .maxAge(Duration.ofSeconds(maxAgeSeconds))
                .build();
    }
}
