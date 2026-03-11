package com.freightclub.security;

import com.freightclub.domain.RefreshToken;
import com.freightclub.exception.InvalidRefreshTokenException;
import com.freightclub.repository.RefreshTokenRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtProperties jwtProperties;
    private final SecureRandom secureRandom = new SecureRandom();

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository, JwtProperties jwtProperties) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtProperties = jwtProperties;
    }

    @Transactional
    public String createRefreshToken(String userId) {
        String rawToken = generateRawToken();
        String tokenHash = hashToken(rawToken);

        RefreshToken entity = new RefreshToken();
        entity.setUserId(userId);
        entity.setTokenHash(tokenHash);
        entity.setExpiresAt(LocalDateTime.now().plusSeconds(jwtProperties.getRefreshTokenExpiryMs() / 1000));

        refreshTokenRepository.save(entity);
        return rawToken;
    }

    @Transactional
    public RotationResult rotateRefreshToken(String rawToken) {
        String tokenHash = hashToken(rawToken);

        RefreshToken existing = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(InvalidRefreshTokenException::new);

        if (!existing.isValid()) {
            throw new InvalidRefreshTokenException();
        }

        existing.setRevoked(true);
        refreshTokenRepository.save(existing);

        String newRawToken = createRefreshToken(existing.getUserId());
        return new RotationResult(newRawToken, existing.getUserId());
    }

    @Transactional
    public void revokeAllForUser(String userId) {
        refreshTokenRepository.deleteAllByUserId(userId);
    }

    private String generateRawToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
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

    public record RotationResult(String newRawToken, String userId) {}
}
