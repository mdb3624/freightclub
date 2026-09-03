package com.freightclub.service;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.UUID;

// Extracted once a second Super User action (US-886, alongside US-881's force-password-reset)
// needed the identical "issue a single-use reset token" logic — same threshold this codebase
// already uses elsewhere for when a duplicated private helper becomes a shared component.
// Runs through superUserReadJdbcTemplate so callers can wrap it in their own
// @Transactional("superUserTransactionManager") method alongside their audit log entry (US-880
// BR-1) — this class holds no transaction boundary of its own.
@Component
public class PasswordResetTokenIssuer {

    private final JdbcTemplate superUserReadJdbcTemplate;
    private final SecureRandom secureRandom = new SecureRandom();

    public PasswordResetTokenIssuer(@Qualifier("superUserReadJdbcTemplate") JdbcTemplate superUserReadJdbcTemplate) {
        this.superUserReadJdbcTemplate = superUserReadJdbcTemplate;
    }

    public String issue(String userId) {
        String rawToken = generateRawToken();
        String tokenHash = hashToken(rawToken);
        superUserReadJdbcTemplate.update(
                "INSERT INTO freightclub.password_reset_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)",
                UUID.randomUUID().toString(), userId, tokenHash, LocalDateTime.now().plusHours(1));
        return rawToken;
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
}
