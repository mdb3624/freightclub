package com.freightclub.service;

import com.freightclub.dto.PlatformHealthResponse;
import com.freightclub.security.RequestMetricsFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

// US-752: platform health signal for the Super User view. AC-4: a failing/unreachable DB
// check must report backendHealthy=false, never throw — the whole point is this page still
// renders when the thing it's monitoring is unhealthy.
@Service
public class PlatformHealthService {

    private static final Logger log = LoggerFactory.getLogger(PlatformHealthService.class);

    private final JdbcTemplate jdbcTemplate;
    private final RequestMetricsFilter requestMetricsFilter;

    public PlatformHealthService(JdbcTemplate jdbcTemplate, RequestMetricsFilter requestMetricsFilter) {
        this.jdbcTemplate = jdbcTemplate;
        this.requestMetricsFilter = requestMetricsFilter;
    }

    // US-752 BR-3: 10-second TTL, materially tighter than US-750's 5-minute dashboard TTL
    // (same comment-only-TTL cache manager convention as the rest of CacheConfig).
    @Cacheable("platformHealth")
    public PlatformHealthResponse getHealth() {
        boolean backendHealthy;
        try {
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            backendHealthy = true;
        } catch (Exception ex) {
            log.warn("Platform health check: backend DB ping failed", ex);
            backendHealthy = false;
        }

        return new PlatformHealthResponse(
                backendHealthy,
                requestMetricsFilter.getTotalRequests(),
                requestMetricsFilter.getErrorResponses()
        );
    }
}
