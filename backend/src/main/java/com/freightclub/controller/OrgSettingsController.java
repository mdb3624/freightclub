package com.freightclub.controller;

import com.freightclub.dto.OrgSettingsResponse;
import com.freightclub.dto.UpdateOrgSettingsRequest;
import com.freightclub.service.OrgSettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

// US-876 (Shipper Admin) / US-878 (Carrier Admin): shared org-settings endpoints, gated on
// ROLE_TENANT_ADMIN (same pattern as TeamController) rather than a persona role.
@RestController
@RequestMapping("/api/v1/team/org-settings")
@PreAuthorize("hasAuthority('ROLE_TENANT_ADMIN')")
public class OrgSettingsController {

    private final OrgSettingsService orgSettingsService;

    public OrgSettingsController(OrgSettingsService orgSettingsService) {
        this.orgSettingsService = orgSettingsService;
    }

    @GetMapping
    public ResponseEntity<OrgSettingsResponse> getOrgSettings(@AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(orgSettingsService.getOrgSettings(userId));
    }

    @PutMapping
    public ResponseEntity<Void> updateOrgSettings(@AuthenticationPrincipal String userId,
                                                   @RequestBody UpdateOrgSettingsRequest request) {
        orgSettingsService.updateOrgSettings(userId, request);
        return ResponseEntity.noContent().build();
    }
}
