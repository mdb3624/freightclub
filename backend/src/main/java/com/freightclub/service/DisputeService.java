package com.freightclub.service;

import com.freightclub.domain.Dispute;
import com.freightclub.dto.RaiseDisputeRequest;
import com.freightclub.repository.DisputeRepository;
import com.freightclub.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Tenant-scoped path: any authenticated tenant member can raise a dispute on a load in their
// own tenant. The Super User side (queue/resolve) is DisputeResolutionService, deliberately
// separate — this one goes through normal RLS/JPA, that one bypasses RLS by design.
@Service
@Transactional
public class DisputeService {

    private final DisputeRepository disputeRepository;
    private final UserRepository userRepository;

    public DisputeService(DisputeRepository disputeRepository, UserRepository userRepository) {
        this.disputeRepository = disputeRepository;
        this.userRepository = userRepository;
    }

    public void raiseDispute(String raisingUserId, RaiseDisputeRequest request) {
        String tenantId = userRepository.findById(raisingUserId)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found: " + raisingUserId))
                .getTenantId();

        Dispute dispute = new Dispute();
        dispute.setTenantId(tenantId);
        dispute.setLoadId(request.loadId());
        dispute.setRaisedByUserId(raisingUserId);
        dispute.setReason(request.reason());
        disputeRepository.save(dispute);
    }
}
