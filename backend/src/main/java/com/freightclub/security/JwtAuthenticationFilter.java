package com.freightclub.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * JWT Authentication Filter - AC-2, AC-3, AC-5, AC-7.
 * Extracts tenant_id from JWT claims and sets thread-local context before request processing.
 * Context is cleared in a finally block to prevent ThreadLocal leaks (AC-3).
 * Executes with highest precedence to ensure context is available to all downstream filters.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    /**
     * AC-2: JwtAuthenticationFilter Context Initialization.
     * Extracts tenant_id from JWT and sets TenantContextHolder before downstream processing.
     * AC-3: Context cleanup is guaranteed in finally block.
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            // Skip JWT validation for test endpoints
            if (request.getRequestURI().startsWith("/api/test/")) {
                filterChain.doFilter(request, response);
                return;
            }

            String token = extractToken(request);
            if (token != null) {
                try {
                    Claims claims = jwtService.validateAndGetClaims(token);
                    String userId = claims.getSubject();
                    String role = claims.get("role", String.class);
                    String tenantId = claims.get("tenantId", String.class);

                    // AC-2: Reject with 403 if tenant_id claim is missing or blank
                    if (tenantId == null || tenantId.isBlank()) {
                        response.setHeader("WWW-Authenticate", "Bearer");
                        response.sendError(HttpServletResponse.SC_FORBIDDEN,
                                "Missing or invalid tenant_id claim in JWT");
                        return;
                    }

                    TenantContextHolder.setTenantId(tenantId);
                    TenantContextHolder.setUserId(userId);

                    var auth = new UsernamePasswordAuthenticationToken(
                            userId,
                            null,
                            List.of(new SimpleGrantedAuthority("ROLE_" + role))
                    );
                    SecurityContextHolder.getContext().setAuthentication(auth);
                } catch (JwtException ex) {
                    // AC-2: Reject with 401 if JWT is invalid or malformed
                    response.setHeader("WWW-Authenticate", "Bearer error=\"invalid_token\"");
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired JWT");
                    SecurityContextHolder.clearContext();
                    return;
                }
            }
            filterChain.doFilter(request, response);
        } finally {
            // AC-3: Clear context in finally block to prevent ThreadLocal leaks even on exception
            TenantContextHolder.clear();
        }
    }

    /**
     * Extracts Bearer token from Authorization header.
     */
    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}
