package com.freightclub.controller;

import com.freightclub.dto.CreateTenantWithFirstUserRequest;
import com.freightclub.dto.ProvisioningResponse;
import com.freightclub.dto.SuperUserActionRequest;
import com.freightclub.service.SuperUserProvisioningService;
import com.freightclub.service.SuperUserTenantManagementService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// US-886 BR-2: creates a brand-new tenant with its first (admin) user — the Super-User-
// initiated equivalent of AuthService.register()'s new-company path.
// US-884: suspend/reactivate an entire tenant's access, added to the same controller since it
// shares the /api/v1/super-user/tenants base path and ROLE_ADMIN gate.
@RestController
@RequestMapping("/api/v1/super-user/tenants")
@PreAuthorize("hasRole('ADMIN')")
public class SuperUserTenantProvisioningController {

    private final SuperUserProvisioningService superUserProvisioningService;
    private final SuperUserTenantManagementService superUserTenantManagementService;

    public SuperUserTenantProvisioningController(SuperUserProvisioningService superUserProvisioningService,
                                                   SuperUserTenantManagementService superUserTenantManagementService) {
        this.superUserProvisioningService = superUserProvisioningService;
        this.superUserTenantManagementService = superUserTenantManagementService;
    }

    @PostMapping
    public ResponseEntity<ProvisioningResponse> createTenantWithFirstUser(@AuthenticationPrincipal String actorUserId,
                                                                            @Valid @RequestBody CreateTenantWithFirstUserRequest request) {
        String token = superUserProvisioningService.createNewTenantWithFirstUser(
                actorUserId, request.companyName(), request.email(), request.firstName(), request.lastName(),
                request.role(), request.reason());
        return ResponseEntity.ok(new ProvisioningResponse(token));
    }

    @PostMapping("/{tenantId}/suspend")
    public ResponseEntity<Void> suspend(@AuthenticationPrincipal String actorUserId,
                                         @PathVariable String tenantId,
                                         @Valid @RequestBody SuperUserActionRequest request) {
        superUserTenantManagementService.suspendTenant(actorUserId, tenantId, request.reason());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{tenantId}/reactivate")
    public ResponseEntity<Void> reactivate(@AuthenticationPrincipal String actorUserId,
                                            @PathVariable String tenantId,
                                            @Valid @RequestBody SuperUserActionRequest request) {
        superUserTenantManagementService.reactivateTenant(actorUserId, tenantId, request.reason());
        return ResponseEntity.noContent().build();
    }
}
