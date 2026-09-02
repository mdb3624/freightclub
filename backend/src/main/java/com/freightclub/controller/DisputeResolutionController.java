package com.freightclub.controller;

import com.freightclub.dto.DisputeQueueItemResponse;
import com.freightclub.dto.ResolveDisputeRequest;
import com.freightclub.service.DisputeResolutionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// US-751: gated ROLE_ADMIN (Super User) — same platform-wide role as SuperUserDashboardController,
// never ROLE_TENANT_ADMIN.
@RestController
@RequestMapping("/api/v1/super-user/disputes")
@PreAuthorize("hasRole('ADMIN')")
public class DisputeResolutionController {

    private final DisputeResolutionService disputeResolutionService;

    public DisputeResolutionController(DisputeResolutionService disputeResolutionService) {
        this.disputeResolutionService = disputeResolutionService;
    }

    @GetMapping
    public ResponseEntity<List<DisputeQueueItemResponse>> listOpenDisputes() {
        return ResponseEntity.ok(disputeResolutionService.listOpenDisputes());
    }

    @PostMapping("/{disputeId}/resolve")
    public ResponseEntity<Void> resolveDispute(@AuthenticationPrincipal String userId,
                                                @PathVariable String disputeId,
                                                @Valid @RequestBody ResolveDisputeRequest request) {
        disputeResolutionService.resolveDispute(userId, disputeId, request);
        return ResponseEntity.noContent().build();
    }
}
