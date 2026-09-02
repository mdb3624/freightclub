package com.freightclub.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.concurrent.atomic.AtomicLong;

// US-752: minimal request-volume/error-rate signal for the Super User platform health view.
// Cumulative since app start, not a rolling window — no existing metrics infra in this
// codebase to build a windowed rate on top of; a simple cumulative counter is still a real
// improvement over the "discovered externally" status quo this story exists to fix (see
// project_production_billing_outage_2026-08-03 postmortem cited in the story doc).
@Component
public class RequestMetricsFilter extends OncePerRequestFilter {

    private final AtomicLong totalRequests = new AtomicLong();
    private final AtomicLong errorResponses = new AtomicLong();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        totalRequests.incrementAndGet();
        try {
            filterChain.doFilter(request, response);
        } finally {
            if (response.getStatus() >= 500) {
                errorResponses.incrementAndGet();
            }
        }
    }

    public long getTotalRequests() {
        return totalRequests.get();
    }

    public long getErrorResponses() {
        return errorResponses.get();
    }
}
