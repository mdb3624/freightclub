package com.freightclub.service;

import com.freightclub.dto.DisputeQueueItemResponse;
import com.freightclub.dto.ResolveDisputeRequest;
import com.freightclub.exception.DisputeNotFoundException;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

// US-751: Super User dispute queue + resolution. Reads/writes through superUserReadJdbcTemplate
// (narrow, BYPASSRLS role — see V20260901_1200/1300), the same cross-tenant pattern as
// SuperUserDashboardService, since a dispute queue spanning every tenant is exactly the kind
// of read the standard RLS-scoped JPA path cannot and should not serve.
@Service
public class DisputeResolutionService {

    private final JdbcTemplate superUserReadJdbcTemplate;

    public DisputeResolutionService(@Qualifier("superUserReadJdbcTemplate") JdbcTemplate superUserReadJdbcTemplate) {
        this.superUserReadJdbcTemplate = superUserReadJdbcTemplate;
    }

    // US-751 AC-1: every open dispute across every tenant, with load/parties/reason context.
    public List<DisputeQueueItemResponse> listOpenDisputes() {
        return superUserReadJdbcTemplate.query(
                """
                SELECT d.id AS id, d.load_id AS load_id, t.name AS tenant_name,
                       u.email AS raised_by_email, d.reason AS reason, d.status AS status,
                       d.created_at AS created_at
                FROM freightclub.disputes d
                JOIN freightclub.tenants t ON t.id = d.tenant_id
                JOIN freightclub.users u ON u.id = d.raised_by_user_id
                WHERE d.status = 'OPEN' AND d.deleted_at IS NULL
                ORDER BY d.created_at ASC
                """,
                (rs, rowNum) -> new DisputeQueueItemResponse(
                        rs.getString("id"), rs.getString("load_id"), rs.getString("tenant_name"),
                        rs.getString("raised_by_email"), rs.getString("reason"), rs.getString("status"),
                        rs.getTimestamp("created_at").toLocalDateTime())
        );
    }

    // US-751 AC-3/BR-3: outcome + non-empty reason are mandatory (enforced by ResolveDisputeRequest's
    // bean validation before this method is ever called) — this method itself just records them.
    // AC-5/BR-5: never touches payment/refund state; only ever writes the columns granted in
    // V20260901_1300 (status, resolution_outcome, resolution_reason, resolved_by_user_id, resolved_at).
    public void resolveDispute(String resolvingAdminUserId, String disputeId, ResolveDisputeRequest request) {
        int updated = superUserReadJdbcTemplate.update(
                """
                UPDATE freightclub.disputes
                SET status = 'RESOLVED', resolution_outcome = ?, resolution_reason = ?,
                    resolved_by_user_id = ?, resolved_at = ?, updated_at = ?
                WHERE id = ? AND status = 'OPEN' AND deleted_at IS NULL
                """,
                request.outcome().name(), request.reason(), resolvingAdminUserId,
                LocalDateTime.now(), LocalDateTime.now(), disputeId
        );
        if (updated == 0) {
            throw new DisputeNotFoundException(disputeId);
        }
    }
}
