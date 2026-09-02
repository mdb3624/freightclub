package com.freightclub.dto;

// US-752: backendHealthy is explicitly a status, not an exception path — AC-4 requires the
// page to render "failing/unknown" rather than crash when the backend check itself fails.
public record PlatformHealthResponse(
        boolean backendHealthy,
        long totalRequests,
        long errorResponses
) {}
