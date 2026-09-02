package com.freightclub.service;

import com.freightclub.dto.SuperUserDashboardResponse;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

// US-750: Super User Dashboard. Reads through superUserReadJdbcTemplate (a narrow, read-only,
// BYPASSRLS role — see V20260901_1200 / LoginLookupDataSourceConfig) rather than the tenant-
// scoped JPA repositories, because this is the one legitimate cross-tenant read on the
// platform (BR-2) and the standard freightclub_runtime connection is RLS-scoped by design.
@Service
public class SuperUserDashboardService {

    private final JdbcTemplate superUserReadJdbcTemplate;

    public SuperUserDashboardService(@Qualifier("superUserReadJdbcTemplate") JdbcTemplate superUserReadJdbcTemplate) {
        this.superUserReadJdbcTemplate = superUserReadJdbcTemplate;
    }

    // US-750 AC-3/BR-4: 5-minute TTL, per NFR-504. (Cache manager here is the same
    // ConcurrentMapCacheManager used platform-wide, which does not itself enforce eviction —
    // see CacheConfig's existing comment-only TTL convention; not a gap introduced by this story.)
    @Cacheable("superUserDashboard")
    public SuperUserDashboardResponse getDashboard() {
        long tenantCount = count("SELECT COUNT(*) FROM freightclub.tenants WHERE deleted_at IS NULL");

        Map<String, Long> userCountByRole = groupCounts(
                "SELECT role AS k, COUNT(*) AS cnt FROM freightclub.users WHERE deleted_at IS NULL GROUP BY role");

        Map<String, Long> loadCountByStatus = groupCounts(
                "SELECT status AS k, COUNT(*) AS cnt FROM freightclub.loads WHERE deleted_at IS NULL GROUP BY status");

        // US-750 AC-4: name, plan, member count only — no cross-tenant load/document content.
        List<SuperUserDashboardResponse.TenantSummary> tenants = superUserReadJdbcTemplate.query(
                """
                SELECT t.name AS name, t.plan AS plan,
                       (SELECT COUNT(*) FROM freightclub.users u
                        WHERE u.tenant_id = t.id AND u.deleted_at IS NULL) AS member_count
                FROM freightclub.tenants t
                WHERE t.deleted_at IS NULL
                ORDER BY t.name ASC
                """,
                (rs, rowNum) -> new SuperUserDashboardResponse.TenantSummary(
                        rs.getString("name"), rs.getString("plan"), rs.getLong("member_count"))
        );

        return new SuperUserDashboardResponse(tenantCount, userCountByRole, loadCountByStatus, tenants);
    }

    private long count(String sql) {
        Long result = superUserReadJdbcTemplate.queryForObject(sql, Long.class);
        return result != null ? result : 0L;
    }

    private Map<String, Long> groupCounts(String sql) {
        Map<String, Long> result = new LinkedHashMap<>();
        for (Map<String, Object> row : superUserReadJdbcTemplate.queryForList(sql)) {
            result.put(String.valueOf(row.get("k")), ((Number) row.get("cnt")).longValue());
        }
        return result;
    }
}
