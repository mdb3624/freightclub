package com.freightclub.controller;

import com.freightclub.dto.RaiseDisputeRequest;
import com.freightclub.service.DisputeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Tenant-scoped: any authenticated member can raise a dispute on a load in their own tenant.
// The Super User queue/resolve surface is DisputeResolutionController, separate and ROLE_ADMIN-gated.
@RestController
@RequestMapping("/api/v1/disputes")
public class DisputeController {

    private final DisputeService disputeService;

    public DisputeController(DisputeService disputeService) {
        this.disputeService = disputeService;
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> raiseDispute(@AuthenticationPrincipal String userId,
                                              @Valid @RequestBody RaiseDisputeRequest request) {
        disputeService.raiseDispute(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
