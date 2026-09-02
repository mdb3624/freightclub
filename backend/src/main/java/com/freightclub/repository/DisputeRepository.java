package com.freightclub.repository;

import com.freightclub.domain.Dispute;
import org.springframework.data.jpa.repository.JpaRepository;

// Tenant-scoped path only (raising a dispute, via RLS + freightclub_runtime). The Super User
// cross-tenant queue/resolve path deliberately bypasses this repository — see
// DisputeResolutionService, which reads/writes via superUserReadJdbcTemplate instead.
public interface DisputeRepository extends JpaRepository<Dispute, String> {
}
