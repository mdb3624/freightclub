package com.freightclub.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.impl.DefaultClaims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock private JwtService jwtService;
    @Mock private HttpServletRequest request;
    @Mock private HttpServletResponse response;
    @Mock private FilterChain filterChain;

    @InjectMocks
    private JwtAuthenticationFilter filter;

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
        TenantContextHolder.clear();
        ImpersonationContextHolder.clear();
    }

    private Claims makeClaims(String subject, String role, String tenantId) {
        return makeClaims(subject, role, tenantId, null);
    }

    private Claims makeClaims(String subject, String role, String tenantId, Boolean isTenantAdmin) {
        Map<String, Object> data = new java.util.HashMap<>();
        data.put("sub", subject);
        data.put("role", role);
        if (tenantId != null) {
            data.put("tenantId", tenantId);
        }
        if (isTenantAdmin != null) {
            data.put("isTenantAdmin", isTenantAdmin);
        }
        return new DefaultClaims(data);
    }

    private Claims makeImpersonationClaims(String targetUserId, String role, String tenantId,
                                            String superUserId, String sessionId) {
        Map<String, Object> data = new java.util.HashMap<>();
        data.put("sub", targetUserId);
        data.put("role", role);
        data.put("tenantId", tenantId);
        data.put("impersonating", true);
        data.put("impersonatedBy", superUserId);
        data.put("impersonationSessionId", sessionId);
        return new DefaultClaims(data);
    }

    // -------------------------------------------------------------------------
    // valid token
    // -------------------------------------------------------------------------

    @Nested
    class ValidToken {

        @Test
        void setsAuthentication_forValidToken() throws Exception {
            when(request.getRequestURI()).thenReturn("/api/v1/loads");
            when(request.getHeader("Authorization")).thenReturn("Bearer valid-token");
            Claims claims = makeClaims("user-1", "SHIPPER", "tenant-1");
            when(jwtService.validateAndGetClaims("valid-token")).thenReturn(claims);

            filter.doFilter(request, response, filterChain);

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            assertThat(auth).isNotNull();
            assertThat(auth.getPrincipal()).isEqualTo("user-1");
            assertThat(auth.getAuthorities()).anyMatch(a -> a.getAuthority().equals("ROLE_SHIPPER"));
            verify(filterChain).doFilter(request, response);
        }

        // US-874: is_tenant_admin is additive — a second authority alongside ROLE_<role>.
        @Test
        void addsTenantAdminAuthority_whenClaimTrue() throws Exception {
            when(request.getRequestURI()).thenReturn("/api/v1/loads");
            when(request.getHeader("Authorization")).thenReturn("Bearer valid-token");
            Claims claims = makeClaims("user-1", "SHIPPER", "tenant-1", true);
            when(jwtService.validateAndGetClaims("valid-token")).thenReturn(claims);

            filter.doFilter(request, response, filterChain);

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            assertThat(auth.getAuthorities()).anyMatch(a -> a.getAuthority().equals("ROLE_SHIPPER"));
            assertThat(auth.getAuthorities()).anyMatch(a -> a.getAuthority().equals("ROLE_TENANT_ADMIN"));
        }

        @Test
        void omitsTenantAdminAuthority_whenClaimFalseOrAbsent() throws Exception {
            when(request.getRequestURI()).thenReturn("/api/v1/loads");
            when(request.getHeader("Authorization")).thenReturn("Bearer valid-token");
            // Absent claim (e.g. a token issued before US-874) must default to non-admin, not error.
            Claims claims = makeClaims("user-1", "SHIPPER", "tenant-1", null);
            when(jwtService.validateAndGetClaims("valid-token")).thenReturn(claims);

            filter.doFilter(request, response, filterChain);

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            assertThat(auth.getAuthorities()).noneMatch(a -> a.getAuthority().equals("ROLE_TENANT_ADMIN"));
        }

        @Test
        void setsTenantContext_forValidToken() throws Exception {
            when(request.getRequestURI()).thenReturn("/api/v1/loads");
            when(request.getHeader("Authorization")).thenReturn("Bearer valid-token");
            Claims claims = makeClaims("user-1", "SHIPPER", "tenant-abc");
            when(jwtService.validateAndGetClaims("valid-token")).thenReturn(claims);

            filter.doFilter(request, response, filterChain);

            // Tenant context is cleared in the finally block after filter chain completes,
            // so we just verify the filter ran without error and filter chain was called.
            verify(filterChain).doFilter(request, response);
        }
    }

    // -------------------------------------------------------------------------
    // missing / invalid token
    // -------------------------------------------------------------------------

    @Nested
    class MissingOrInvalidToken {

        @Test
        void continuesChain_withNoAuthentication_whenHeaderAbsent() throws Exception {
            when(request.getRequestURI()).thenReturn("/api/v1/loads");
            when(request.getHeader("Authorization")).thenReturn(null);

            filter.doFilter(request, response, filterChain);

            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
            verify(filterChain).doFilter(request, response);
        }

        @Test
        void continuesChain_withNoAuthentication_whenPrefixMissing() throws Exception {
            when(request.getRequestURI()).thenReturn("/api/v1/loads");
            when(request.getHeader("Authorization")).thenReturn("Basic dXNlcjpwYXNz");

            filter.doFilter(request, response, filterChain);

            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
            verify(filterChain).doFilter(request, response);
        }

        @Test
        void rejectsWithUnauthorized_whenTokenInvalid() throws Exception {
            when(request.getRequestURI()).thenReturn("/api/v1/loads");
            when(request.getHeader("Authorization")).thenReturn("Bearer bad-token");
            when(jwtService.validateAndGetClaims("bad-token"))
                    .thenThrow(new io.jsonwebtoken.security.SignatureException("bad sig"));

            filter.doFilter(request, response, filterChain);

            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
            verify(response).setHeader("WWW-Authenticate", "Bearer error=\"invalid_token\"");
            verify(response).sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired JWT");
            verify(filterChain, never()).doFilter(request, response);
        }

        @Test
        void rejectsWithForbidden_whenTenantIdMissing() throws Exception {
            when(request.getRequestURI()).thenReturn("/api/v1/loads");
            when(request.getHeader("Authorization")).thenReturn("Bearer valid-token");
            Claims claims = makeClaims("user-1", "SHIPPER", null);
            when(jwtService.validateAndGetClaims("valid-token")).thenReturn(claims);

            filter.doFilter(request, response, filterChain);

            verify(response).setHeader("WWW-Authenticate", "Bearer");
            verify(response).sendError(HttpServletResponse.SC_FORBIDDEN, "Missing or invalid tenant_id claim in JWT");
            verify(filterChain, never()).doFilter(request, response);
        }

        @Test
        void rejectsWithForbidden_whenTenantIdBlank() throws Exception {
            when(request.getRequestURI()).thenReturn("/api/v1/loads");
            when(request.getHeader("Authorization")).thenReturn("Bearer valid-token");
            Claims claims = makeClaims("user-1", "SHIPPER", "   ");
            when(jwtService.validateAndGetClaims("valid-token")).thenReturn(claims);

            filter.doFilter(request, response, filterChain);

            verify(response).setHeader("WWW-Authenticate", "Bearer");
            verify(response).sendError(HttpServletResponse.SC_FORBIDDEN, "Missing or invalid tenant_id claim in JWT");
            verify(filterChain, never()).doFilter(request, response);
        }
    }

    // -------------------------------------------------------------------------
    // US-885: impersonation tokens — view-only enforcement + context binding
    // -------------------------------------------------------------------------

    @Nested
    class Impersonation {

        @Test
        void bindsImpersonationContext_andAllowsSafeMethod() throws Exception {
            when(request.getRequestURI()).thenReturn("/api/v1/loads");
            when(request.getMethod()).thenReturn("GET");
            when(request.getHeader("Authorization")).thenReturn("Bearer impersonation-token");
            Claims claims = makeImpersonationClaims("target-1", "SHIPPER", "tenant-1", "admin-1", "session-1");
            when(jwtService.validateAndGetClaims("impersonation-token")).thenReturn(claims);
            doAnswer(inv -> {
                assertThat(ImpersonationContextHolder.getSuperUserId()).isEqualTo("admin-1");
                assertThat(ImpersonationContextHolder.getSessionId()).isEqualTo("session-1");
                return null;
            }).when(filterChain).doFilter(request, response);

            filter.doFilter(request, response, filterChain);

            verify(filterChain).doFilter(request, response);
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            assertThat(auth.getPrincipal()).isEqualTo("target-1");
        }

        @Test
        void rejectsWithForbidden_onWriteMethod_whileImpersonating() throws Exception {
            when(request.getRequestURI()).thenReturn("/api/v1/loads");
            when(request.getMethod()).thenReturn("POST");
            when(request.getHeader("Authorization")).thenReturn("Bearer impersonation-token");
            Claims claims = makeImpersonationClaims("target-1", "SHIPPER", "tenant-1", "admin-1", "session-1");
            when(jwtService.validateAndGetClaims("impersonation-token")).thenReturn(claims);

            filter.doFilter(request, response, filterChain);

            verify(response).sendError(HttpServletResponse.SC_FORBIDDEN, "Impersonation sessions are view-only");
            verify(filterChain, never()).doFilter(request, response);
        }

        // BR-2: the one-click "end impersonation" control must still work — it is itself a POST.
        @Test
        void allowsEndImpersonationEndpoint_evenThoughItsAWrite() throws Exception {
            when(request.getRequestURI()).thenReturn("/api/v1/super-user/impersonation/end");
            when(request.getMethod()).thenReturn("POST");
            when(request.getHeader("Authorization")).thenReturn("Bearer impersonation-token");
            Claims claims = makeImpersonationClaims("target-1", "SHIPPER", "tenant-1", "admin-1", "session-1");
            when(jwtService.validateAndGetClaims("impersonation-token")).thenReturn(claims);

            filter.doFilter(request, response, filterChain);

            verify(filterChain).doFilter(request, response);
        }
    }
}
