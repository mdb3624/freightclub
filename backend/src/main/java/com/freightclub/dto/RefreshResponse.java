package com.freightclub.dto;

public record RefreshResponse(
        String accessToken,
        String tokenType,
        long expiresIn
) {
    public static RefreshResponse of(String accessToken, long expiresInSeconds) {
        return new RefreshResponse(accessToken, "Bearer", expiresInSeconds);
    }
}
