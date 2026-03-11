package com.freightclub.security;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

@Validated
@ConfigurationProperties(prefix = "app.jwt")
public class JwtProperties {

    @NotBlank
    private String secret;

    @Positive
    private long accessTokenExpiryMs = 900_000L;

    @Positive
    private long refreshTokenExpiryMs = 604_800_000L;

    public String getSecret() { return secret; }
    public void setSecret(String secret) { this.secret = secret; }

    public long getAccessTokenExpiryMs() { return accessTokenExpiryMs; }
    public void setAccessTokenExpiryMs(long accessTokenExpiryMs) { this.accessTokenExpiryMs = accessTokenExpiryMs; }

    public long getRefreshTokenExpiryMs() { return refreshTokenExpiryMs; }
    public void setRefreshTokenExpiryMs(long refreshTokenExpiryMs) { this.refreshTokenExpiryMs = refreshTokenExpiryMs; }
}
