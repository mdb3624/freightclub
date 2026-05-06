package com.freightclub.security;

import com.freightclub.domain.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey signingKey;
    private final long accessTokenExpiryMs;
    private final String issuer;
    private final String audience;

    public JwtService(JwtProperties props) {
        byte[] keyBytes = props.getSecret().getBytes(StandardCharsets.UTF_8);
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        this.accessTokenExpiryMs = props.getAccessTokenExpiryMs();
        this.issuer = props.getIssuer();
        this.audience = props.getAudience();
    }

    public String generateAccessToken(User user) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + accessTokenExpiryMs);

        return Jwts.builder()
                .subject(user.getId())
                .claim("email", user.getEmail())
                .claim("role", user.getRole().name())
                .claim("tenantId", user.getTenantId())
                .issuer(issuer)
                .audience().add(audience).and()
                .issuedAt(now)
                .expiration(expiry)
                .signWith(signingKey)
                .compact();
    }

    public Claims validateAndGetClaims(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        // JJWT 0.12.x parses aud as Set<String>; requireAudience(String) uses equality not membership
        if (!issuer.equals(claims.getIssuer())) {
            throw new io.jsonwebtoken.MalformedJwtException("Invalid issuer");
        }
        java.util.Set<String> aud = claims.getAudience();
        if (aud == null || !aud.contains(audience)) {
            throw new io.jsonwebtoken.MalformedJwtException("Invalid audience");
        }
        return claims;
    }

    public long getAccessTokenExpiryMs() {
        return accessTokenExpiryMs;
    }
}
