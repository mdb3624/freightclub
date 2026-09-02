package com.freightclub.service;

import com.freightclub.domain.PasswordResetToken;
import com.freightclub.domain.User;
import com.freightclub.exception.InvalidPasswordResetTokenException;
import com.freightclub.exception.PasswordBreachedException;
import com.freightclub.repository.PasswordResetTokenRepository;
import com.freightclub.repository.UserRepository;
import com.freightclub.security.BreachCheckResult;
import com.freightclub.security.LoginLookupRepository;
import com.freightclub.security.PasswordBreachChecker;
import com.freightclub.security.RefreshTokenService;
import com.freightclub.security.TenantContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Base64;

// US-881 BR-4: public, self-service redemption of a token a Super User issued via
// forcePasswordReset — the user, not the Super User, sets their own new password. Mirrors
// AuthService.refresh()'s pattern (resolve tenant via loginLookupRepository, bind
// TenantContextHolder around the tenant-scoped write) since the raw token, like a refresh
// token, carries no tenant of its own.
@Service
public class PasswordResetService {

    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final LoginLookupRepository loginLookupRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordBreachChecker passwordBreachChecker;
    private final RefreshTokenService refreshTokenService;

    public PasswordResetService(PasswordResetTokenRepository passwordResetTokenRepository,
                                 LoginLookupRepository loginLookupRepository,
                                 UserRepository userRepository,
                                 PasswordEncoder passwordEncoder,
                                 PasswordBreachChecker passwordBreachChecker,
                                 RefreshTokenService refreshTokenService) {
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.loginLookupRepository = loginLookupRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.passwordBreachChecker = passwordBreachChecker;
        this.refreshTokenService = refreshTokenService;
    }

    @Transactional
    public void redeem(String rawToken, String newPassword) {
        String tokenHash = hashToken(rawToken);
        PasswordResetToken token = passwordResetTokenRepository.findByTokenHashForUpdate(tokenHash)
                .orElseThrow(InvalidPasswordResetTokenException::new);

        if (!token.isValid()) {
            throw new InvalidPasswordResetTokenException();
        }

        if (passwordBreachChecker.isBreached(newPassword) == BreachCheckResult.BREACHED) {
            throw new PasswordBreachedException();
        }

        String tenantId = loginLookupRepository.findUserById(token.getUserId())
                .orElseThrow(InvalidPasswordResetTokenException::new)
                .tenantId();

        TenantContextHolder.setTenantId(tenantId);
        TenantContextHolder.setUserId(token.getUserId());
        try {
            User user = userRepository.findById(token.getUserId())
                    .orElseThrow(InvalidPasswordResetTokenException::new);
            user.setPasswordHash(passwordEncoder.encode(newPassword));
            userRepository.save(user);
        } finally {
            TenantContextHolder.clear();
        }

        token.setUsedAt(LocalDateTime.now());
        passwordResetTokenRepository.save(token);
        refreshTokenService.revokeAllForUser(token.getUserId());
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes());
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
