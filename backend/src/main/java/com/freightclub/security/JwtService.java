package com.freightclub.security;

import com.freightclub.domain.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey signingKey;
    private final long accessTokenExpiryMs;

    public JwtService(JwtProperties props) {
        byte[] keyBytes = Base64.getDecoder().decode(props.getSecret());
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        this.accessTokenExpiryMs = props.getAccessTokenExpiryMs();
    }

    public String generateAccessToken(User user) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + accessTokenExpiryMs);

        return Jwts.builder()
                .subject(user.getId())
                .claim("email", user.getEmail())
                .claim("role", user.getRole().name())
                .claim("tenantId", user.getTenantId())
                .issuedAt(now)
                .expiration(expiry)
                .signWith(signingKey)
                .compact();
    }

    public Claims validateAndGetClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public long getAccessTokenExpiryMs() {
        return accessTokenExpiryMs;
    }
}
