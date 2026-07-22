package com.freightclub.controller;

import com.freightclub.domain.User;
import com.freightclub.domain.UserRole;
import com.freightclub.dto.AuthResponse;
import com.freightclub.dto.RegisterRequest;
import com.freightclub.dto.UserResponse;
import com.freightclub.repository.UserRepository;
import com.freightclub.security.LoginLookupRepository;
import com.freightclub.security.TenantContextHolder;
import com.freightclub.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * TEST-ONLY Authentication Controller for E2E tests.
 * Endpoint: POST /api/test/auth/register
 * Creates a test user and returns auth response with refresh token cookie.
 * Only available in non-production environments.
 */
@RestController
@RequestMapping("/api/test/auth")
public class TestAuthController {

  private final AuthService authService;
  private final UserRepository userRepository;
  private final LoginLookupRepository loginLookupRepository;

  public TestAuthController(AuthService authService, UserRepository userRepository,
      LoginLookupRepository loginLookupRepository) {
    this.authService = authService;
    this.userRepository = userRepository;
    this.loginLookupRepository = loginLookupRepository;
  }

  public static class TestUserRequest {
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String role;
    private String companyName;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
  }

  @PostMapping("/register")
  public ResponseEntity<AuthResponse> registerTestUser(@RequestBody TestUserRequest req) {
    try {
      AuthService.AuthResult result = authService.register(new RegisterRequest(
          req.getEmail(),
          req.getPassword(),
          req.getFirstName(),
          req.getLastName(),
          UserRole.valueOf(req.getRole().toUpperCase()),
          req.getCompanyName(),
          null, null, null, null
      ));

      ResponseCookie cookie = ResponseCookie
          .from("refreshToken", result.rawRefreshToken())
          .httpOnly(true)
          .secure(false)
          .path("/")
          .maxAge(7 * 24 * 60 * 60)
          .sameSite("Lax")
          .build();

      AuthResponse body = AuthResponse.of(
          result.accessToken(),
          authService.accessTokenExpirySeconds(),
          UserResponse.from(result.user())
      );

      return ResponseEntity.ok()
          .header(HttpHeaders.SET_COOKIE, cookie.toString())
          .body(body);
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  @DeleteMapping("/users/{userId}")
  public ResponseEntity<Void> deleteTestUser(@PathVariable String userId) {
    // /api/test/ is skipped by JwtAuthenticationFilter, so no tenant context is bound here —
    // resolve it via the pre-auth login-lookup role first (US-858), same as every other
    // cross-tenant read in the auth path, otherwise this silently no-ops under RLS.
    loginLookupRepository.findUserById(userId).ifPresent(credentials -> {
      TenantContextHolder.setTenantId(credentials.tenantId());
      try {
        userRepository.findById(userId).ifPresent(user -> {
          user.setDeletedAt(LocalDateTime.now());
          userRepository.save(user);
        });
      } finally {
        TenantContextHolder.clear();
      }
    });
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/debug/cookies")
  public ResponseEntity<?> debugCookies(
      HttpServletRequest request,
      @CookieValue(name = "refreshToken", required = false) String refreshToken) {
    return ResponseEntity.ok(java.util.Map.of(
        "refreshTokenCookie", refreshToken != null ? "present" : "missing",
        "authorizationHeader", request.getHeader("Authorization") != null ? "present" : "missing",
        "allHeaders", request.getHeaderNames().asIterator().hasNext() ? "yes" : "no"
    ));
  }
}
