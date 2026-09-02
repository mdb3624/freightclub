package com.freightclub.service;

import com.freightclub.domain.Tenant;
import com.freightclub.domain.User;
import com.freightclub.domain.UserRole;
import com.freightclub.dto.LoginRequest;
import com.freightclub.dto.RegisterRequest;
import com.freightclub.exception.EmailAlreadyExistsException;
import com.freightclub.exception.InvalidJoinCodeException;
import com.freightclub.exception.PasswordBreachedException;
import com.freightclub.repository.TenantRepository;
import com.freightclub.repository.UserRepository;
import com.freightclub.security.AuthenticatedUserPrincipal;
import com.freightclub.security.BreachCheckResult;
import com.freightclub.security.JwtService;
import com.freightclub.security.LoginLookupRepository;
import com.freightclub.security.PasswordBreachChecker;
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
    private final PasswordBreachChecker passwordBreachChecker;

    public AuthService(UserRepository userRepository,
                       TenantRepository tenantRepository,
                       LoginLookupRepository loginLookupRepository,
                       JwtService jwtService,
                       RefreshTokenService refreshTokenService,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       PasswordBreachChecker passwordBreachChecker) {
        this.userRepository = userRepository;
        this.tenantRepository = tenantRepository;
        this.loginLookupRepository = loginLookupRepository;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.passwordBreachChecker = passwordBreachChecker;
    }

    public AuthResult register(RegisterRequest request) {
        // No tenant context yet — must check across all tenants, so this goes through
        // freightclub_login_lookup, not the JPA path (which would silently always return
        // false under RLS with no context bound, letting duplicate emails through).
        if (loginLookupRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyExistsException(request.email());
        }

        // US-866 AC-1/BR-1: fail-fast boundary check — reject a breached password before any
        // tenant/user work happens. AC-4/BR-4: BreachCheckResult.CHECK_UNAVAILABLE (disabled or
        // the corpus couldn't be reached) is deliberately treated the same as CLEAN here — only
        // a confirmed BREACHED result rejects. See docs/roles/CODER.md Fail-Fast Boundary
        // Validation.
        if (passwordBreachChecker.isBreached(request.password()) == BreachCheckResult.BREACHED) {
            throw new PasswordBreachedException();
        }

        boolean hasJoinCode = request.joinCode() != null && !request.joinCode().isBlank();
        boolean hasCompanyName = request.companyName() != null && !request.companyName().isBlank();

        String tenantId;
        // US-874 BR-2/BR-3: creating a brand-new tenant makes this user its admin; joining
        // an existing one via join code never does, regardless of the inviting member's own
        // admin status.
        boolean isNewTenantAdmin;
        if (hasJoinCode) {
            // No tenant context exists yet — this lookup crosses tenant boundaries by
            // definition, so it runs through freightclub_login_lookup, not the JPA/
            // freightclub_runtime path (which no longer bypasses RLS).
            TenantLookupResult tenant = loginLookupRepository
                    .findTenantByJoinCode(request.joinCode().toUpperCase().trim())
                    .orElseThrow(InvalidJoinCodeException::new);
            tenantId = tenant.tenantId();
            isNewTenantAdmin = false;
        } else if (hasCompanyName) {
            // Brand-new tenant: tenants_insert (V20260721_1401) allows this with no
            // context bound — it's the root of the multi-tenancy hierarchy.
            Tenant tenant = new Tenant();
            tenant.setName(request.companyName());
            tenant.setJoinCode(generateJoinCode());
            tenantRepository.save(tenant);
            tenantId = tenant.getId();
            isNewTenantAdmin = true;
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
        user.setTenantAdmin(isNewTenantAdmin);

        if (request.role() == UserRole.TRUCKER) {
            user.setMcNumber(request.mcNumber());
            user.setDotNumber(request.dotNumber());
            user.setEquipmentType(request.equipmentType());
        }

        // users_tenant_isolation's WITH CHECK requires tenant_id = app.current_tenant — bind
        // it for this INSERT, cleared in finally to avoid leaking into whatever runs next on
        // this thread. setTenantId itself re-applies SET LOCAL to this transaction's already-
        // open connection (register()'s transaction started before the tenant was known).
        TenantContextHolder.setTenantId(tenantId);
        try {
            // US-876/878 AC-2: a new member joining via join code inherits org defaults at
            // signup. Brand-new-tenant admins have no org defaults yet to inherit (BR-3 only
            // applies to joining an existing tenant), so this only runs on the join path.
            if (hasJoinCode) {
                applyOrgDefaults(user, tenantId);
            }
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
        // below succeeds under users_tenant_isolation — setTenantId re-applies SET LOCAL to
        // this transaction's already-open connection itself (mid-transaction, like register()).
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

    // US-876/878 BR-3/AC-2: pre-fills a brand-new member's fields from their tenant's org
    // defaults. Only ever called at creation (before the user has any values of their own to
    // clobber), so there is no "existing customization" to protect here — that protection
    // lives entirely in OrgSettingsService, which never touches individual users' rows.
    private void applyOrgDefaults(User user, String tenantId) {
        tenantRepository.findById(tenantId).ifPresent(tenant -> {
            if (tenant.getDefaultPickupAddress1() != null) user.setDefaultPickupAddress1(tenant.getDefaultPickupAddress1());
            if (tenant.getDefaultPickupAddress2() != null) user.setDefaultPickupAddress2(tenant.getDefaultPickupAddress2());
            if (tenant.getDefaultPickupCity() != null) user.setDefaultPickupCity(tenant.getDefaultPickupCity());
            if (tenant.getDefaultPickupState() != null) user.setDefaultPickupState(tenant.getDefaultPickupState());
            if (tenant.getDefaultPickupZip() != null) user.setDefaultPickupZip(tenant.getDefaultPickupZip());
            if (tenant.getBillingAddress1() != null) user.setBillingAddress1(tenant.getBillingAddress1());
            if (tenant.getBillingAddress2() != null) user.setBillingAddress2(tenant.getBillingAddress2());
            if (tenant.getBillingCity() != null) user.setBillingCity(tenant.getBillingCity());
            if (tenant.getBillingState() != null) user.setBillingState(tenant.getBillingState());
            if (tenant.getBillingZip() != null) user.setBillingZip(tenant.getBillingZip());
            if (tenant.getFuelCostPerGallon() != null) user.setFuelCostPerGallon(tenant.getFuelCostPerGallon());
            if (tenant.getMaintenanceCostPerMile() != null) user.setMaintenanceCostPerMile(tenant.getMaintenanceCostPerMile());
            if (tenant.getMonthlyFixedCosts() != null) user.setMonthlyFixedCosts(tenant.getMonthlyFixedCosts());
            if (tenant.getTargetMarginPerMile() != null) user.setTargetMarginPerMile(tenant.getTargetMarginPerMile());
            if (tenant.getNotifyEmail() != null) user.setNotifyEmail(tenant.getNotifyEmail());
            if (tenant.getNotifySms() != null) user.setNotifySms(tenant.getNotifySms());
            if (tenant.getNotifyInApp() != null) user.setNotifyInApp(tenant.getNotifyInApp());
        });
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
