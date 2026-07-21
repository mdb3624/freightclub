package com.freightclub.service;

import com.freightclub.domain.Tenant;
import com.freightclub.domain.User;
import com.freightclub.domain.UserRole;
import com.freightclub.dto.LoginRequest;
import com.freightclub.dto.RegisterRequest;
import com.freightclub.exception.EmailAlreadyExistsException;
import com.freightclub.exception.InvalidJoinCodeException;
import com.freightclub.repository.TenantRepository;
import com.freightclub.repository.UserRepository;
import com.freightclub.security.AuthenticatedUserPrincipal;
import com.freightclub.security.JwtService;
import com.freightclub.security.LoginLookupRepository;
import com.freightclub.security.RefreshTokenService;
import com.freightclub.security.TenantContextHolder;
import com.freightclub.security.TenantLookupResult;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;

@Service
@Transactional
public class AuthService {

    private static final String JOIN_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int JOIN_CODE_LENGTH = 8;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final LoginLookupRepository loginLookupRepository;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                       TenantRepository tenantRepository,
                       LoginLookupRepository loginLookupRepository,
                       JwtService jwtService,
                       RefreshTokenService refreshTokenService,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.tenantRepository = tenantRepository;
        this.loginLookupRepository = loginLookupRepository;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
    }

    public AuthResult register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyExistsException(request.email());
        }

        boolean hasJoinCode = request.joinCode() != null && !request.joinCode().isBlank();
        boolean hasCompanyName = request.companyName() != null && !request.companyName().isBlank();

        String tenantId;
        if (hasJoinCode) {
            // No tenant context exists yet — this lookup crosses tenant boundaries by
            // definition, so it runs through freightclub_login_lookup, not the JPA/
            // freightclub_runtime path (which no longer bypasses RLS).
            TenantLookupResult tenant = loginLookupRepository
                    .findTenantByJoinCode(request.joinCode().toUpperCase().trim())
                    .orElseThrow(InvalidJoinCodeException::new);
            tenantId = tenant.tenantId();
        } else if (hasCompanyName) {
            // Brand-new tenant: tenants_insert (V20260721_1401) allows this with no
            // context bound — it's the root of the multi-tenancy hierarchy.
            Tenant tenant = new Tenant();
            tenant.setName(request.companyName());
            tenant.setJoinCode(generateJoinCode());
            tenantRepository.save(tenant);
            tenantId = tenant.getId();
        } else {
            throw new IllegalArgumentException("Either companyName or joinCode is required");
        }

        User user = new User();
        user.setTenantId(tenantId);
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(request.role());
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());

        if (request.role() == UserRole.TRUCKER) {
            user.setMcNumber(request.mcNumber());
            user.setDotNumber(request.dotNumber());
            user.setEquipmentType(request.equipmentType());
        }

        // users_tenant_isolation's WITH CHECK requires tenant_id = app.current_tenant —
        // bind it for this INSERT, same pattern JwtAuthenticationFilter uses for every
        // other authenticated request, cleared in finally to avoid leaking into whatever
        // runs next on this thread.
        TenantContextHolder.setTenantId(tenantId);
        try {
            userRepository.save(user);
        } finally {
            TenantContextHolder.clear();
        }

        String accessToken = jwtService.generateAccessToken(user);
        String rawRefreshToken = refreshTokenService.createRefreshToken(user.getId());

        return new AuthResult(accessToken, rawRefreshToken, user);
    }

    public AuthResult login(LoginRequest request) {
        Authentication authResult = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );
        AuthenticatedUserPrincipal principal = (AuthenticatedUserPrincipal) authResult.getPrincipal();

        // Tenant context wasn't known until authentication succeeded (UserDetailsServiceImpl
        // resolved it via freightclub_login_lookup). Bind it now so the full-profile read
        // below succeeds under users_tenant_isolation instead of needing a bypass.
        User user;
        TenantContextHolder.setTenantId(principal.getTenantId());
        TenantContextHolder.setUserId(principal.getUserId());
        try {
            user = userRepository.findByEmailAndDeletedAtIsNull(request.email())
                    .orElseThrow(() -> new IllegalStateException("User disappeared after authentication"));
        } finally {
            TenantContextHolder.clear();
        }

        String accessToken = jwtService.generateAccessToken(user);
        String rawRefreshToken = refreshTokenService.createRefreshToken(user.getId());

        return new AuthResult(accessToken, rawRefreshToken, user);
    }

    public RefreshResult refresh(String rawRefreshToken) {
        RefreshTokenService.RotationResult rotation = refreshTokenService.rotateRefreshToken(rawRefreshToken);

        // /api/v1/auth/refresh is skipped by JwtAuthenticationFilter same as login/register —
        // the raw refresh token only carries a userId, tenant is unknown until resolved.
        // refresh_tokens itself has no tenant_id/RLS (V20260422_04); only the users read
        // below needs this.
        String tenantId = loginLookupRepository.findUserById(rotation.userId())
                .orElseThrow(() -> new IllegalStateException("User not found for refresh token"))
                .tenantId();

        User user;
        TenantContextHolder.setTenantId(tenantId);
        TenantContextHolder.setUserId(rotation.userId());
        try {
            user = userRepository.findById(rotation.userId())
                    .orElseThrow(() -> new IllegalStateException("User not found for refresh token"));
        } finally {
            TenantContextHolder.clear();
        }

        String newAccessToken = jwtService.generateAccessToken(user);

        return new RefreshResult(newAccessToken, rotation.newRawToken());
    }

    public void logout(String userId) {
        refreshTokenService.revokeAllForUser(userId);
    }

    public long accessTokenExpirySeconds() {
        return jwtService.getAccessTokenExpiryMs() / 1000;
    }

    private String generateJoinCode() {
        StringBuilder sb = new StringBuilder(JOIN_CODE_LENGTH);
        for (int i = 0; i < JOIN_CODE_LENGTH; i++) {
            sb.append(JOIN_CODE_CHARS.charAt(RANDOM.nextInt(JOIN_CODE_CHARS.length())));
        }
        return sb.toString();
    }

    public record AuthResult(String accessToken, String rawRefreshToken, User user) {}
    public record RefreshResult(String accessToken, String rawRefreshToken) {}
}
