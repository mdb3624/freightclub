package com.freightclub.dto;

import java.util.List;
import java.util.Map;

// US-750: Super User Dashboard — the one legitimate cross-tenant, read-only view on the
// platform. Tenant rows deliberately carry only name/plan/memberCount, never load/document
// content (US-750 BR-2/AC-4) — this stays a health-at-a-glance surface, not a data browser.
public record SuperUserDashboardResponse(
        long tenantCount,
        Map<String, Long> userCountByRole,
        Map<String, Long> loadCountByStatus,
        List<TenantSummary> tenants
) {
    public record TenantSummary(String id, String name, String plan, long memberCount) {}
}
