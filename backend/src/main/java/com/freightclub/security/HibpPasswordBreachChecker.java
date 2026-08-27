package com.freightclub.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;

/**
 * Have I Been Pwned "Pwned Passwords" range API (k-anonymity model): only the first 5 hex
 * characters of the password's SHA-1 hash are ever sent over the network — the full password
 * and full hash never leave this process. See US-866.
 */
@Service
public class HibpPasswordBreachChecker implements PasswordBreachChecker {

    private static final Logger log = LoggerFactory.getLogger(HibpPasswordBreachChecker.class);

    @Value("${app.hibp.enabled:true}")
    private boolean enabled;

    @Value("${app.hibp.base-url:https://api.pwnedpasswords.com}")
    private String baseUrl;

    private final RestTemplate restTemplate;

    public HibpPasswordBreachChecker() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout((int) Duration.ofSeconds(3).toMillis());
        factory.setReadTimeout((int) Duration.ofSeconds(5).toMillis());
        this.restTemplate = new RestTemplate(factory);
    }

    // Package-visible for tests: inject a RestTemplate wired to MockRestServiceServer instead
    // of the real network client above.
    HibpPasswordBreachChecker(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public BreachCheckResult isBreached(String password) {
        if (!enabled) {
            return BreachCheckResult.CHECK_UNAVAILABLE;
        }

        try {
            String sha1Hex = sha1Hex(password);
            String prefix = sha1Hex.substring(0, 5);
            String suffix = sha1Hex.substring(5);

            String body = restTemplate.getForObject(baseUrl + "/range/" + prefix, String.class);
            if (body == null) {
                log.warn("HIBP range query returned no body — treating as unavailable, not blocking (US-866 AC-4)");
                return BreachCheckResult.CHECK_UNAVAILABLE;
            }

            for (String line : body.split("\r?\n")) {
                int colon = line.indexOf(':');
                if (colon < 0) {
                    continue;
                }
                String candidateSuffix = line.substring(0, colon);
                if (candidateSuffix.equalsIgnoreCase(suffix)) {
                    return BreachCheckResult.BREACHED;
                }
            }
            return BreachCheckResult.CLEAN;
        } catch (Exception e) {
            log.warn("HIBP breach check failed ({}: {}) — treating as unavailable, not blocking registration (US-866 AC-4)",
                    e.getClass().getSimpleName(), e.getMessage());
            return BreachCheckResult.CHECK_UNAVAILABLE;
        }
    }

    private static String sha1Hex(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-1");
            byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                sb.append(String.format("%02X", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            // SHA-1 is a JDK-guaranteed algorithm (JLS/JCA standard names) — cannot happen.
            throw new IllegalStateException("SHA-1 unavailable", e);
        }
    }
}
