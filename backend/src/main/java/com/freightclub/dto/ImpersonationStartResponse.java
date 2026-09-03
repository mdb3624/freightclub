package com.freightclub.dto;

import java.time.Instant;

public record ImpersonationStartResponse(
        String impersonationToken,
        String sessionId,
        Instant expiresAt,
        TargetUserSummary target
) {}
