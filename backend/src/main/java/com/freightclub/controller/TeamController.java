package com.freightclub.controller;

import com.freightclub.dto.JoinCodeResponse;
import com.freightclub.dto.SetTenantAdminRequest;
import com.freightclub.dto.TeamMemberResponse;
import com.freightclub.service.TeamService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// US-875 (Shipper Admin) / US-877 (Carrier Admin): shared team-management endpoints. Gated on
// ROLE_TENANT_ADMIN (US-874's additive JWT authority) rather than a persona role, so one
// controller correctly serves both Shipper and Carrier admins without a persona branch —
// RLS + TeamService's own tenant check keep each admin scoped to their own tenant's members.
// BR-7 (both stories): this surface is reached only via its own route, never surfaced inline
// on the load board/dashboard — enforced by frontend routing, not this controller.
@RestController
@RequestMapping("/api/v1/team")
@PreAuthorize("hasAuthority('ROLE_TENANT_ADMIN')")
public class TeamController {

    private final TeamService teamService;

    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    @GetMapping("/members")
    public ResponseEntity<List<TeamMemberResponse>> listMembers(@AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(teamService.listMembers(userId));
    }

    @GetMapping("/join-code")
    public ResponseEntity<JoinCodeResponse> getJoinCode(@AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(teamService.getJoinCode(userId));
    }

    @DeleteMapping("/members/{targetUserId}")
    public ResponseEntity<Void> removeMember(@AuthenticationPrincipal String userId,
                                              @PathVariable String targetUserId) {
        teamService.removeMember(userId, targetUserId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/members/{targetUserId}/admin-status")
    public ResponseEntity<Void> setAdminStatus(@AuthenticationPrincipal String userId,
                                                @PathVariable String targetUserId,
                                                @RequestBody SetTenantAdminRequest request) {
        teamService.setTenantAdminStatus(userId, targetUserId, request.isTenantAdmin());
        return ResponseEntity.noContent().build();
    }
}
