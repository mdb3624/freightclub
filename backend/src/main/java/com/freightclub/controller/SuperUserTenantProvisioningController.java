package com.freightclub.controller;

import com.freightclub.dto.CreateTenantWithFirstUserRequest;
import com.freightclub.dto.ProvisioningResponse;
import com.freightclub.service.SuperUserProvisioningService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// US-886 BR-2: creates a brand-new tenant with its first (admin) user — the Super-User-
// initiated equivalent of AuthService.register()'s new-company path.
@RestController
@RequestMapping("/api/v1/super-user/tenants")
@PreAuthorize("hasRole('ADMIN')")
public class SuperUserTenantProvisioningController {

    private final SuperUserProvisioningService superUserProvisioningService;

    public SuperUserTenantProvisioningController(SuperUserProvisioningService superUserProvisioningService) {
        this.superUserProvisioningService = superUserProvisioningService;
    }

    @PostMapping
    public ResponseEntity<ProvisioningResponse> createTenantWithFirstUser(@AuthenticationPrincipal String actorUserId,
                                                                            @Valid @RequestBody CreateTenantWithFirstUserRequest request) {
        String token = superUserProvisioningService.createNewTenantWithFirstUser(
                actorUserId, request.companyName(), request.email(), request.firstName(), request.lastName(),
                request.role(), request.reason());
        return ResponseEntity.ok(new ProvisioningResponse(token));
    }
}
