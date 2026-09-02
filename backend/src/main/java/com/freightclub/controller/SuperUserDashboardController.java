package com.freightclub.controller;

import com.freightclub.dto.SuperUserDashboardResponse;
import com.freightclub.service.SuperUserDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// US-750: gated on ROLE_ADMIN (the platform-wide "Super User" role) — not ROLE_TENANT_ADMIN,
// which is the unrelated tenant-scoped capability from US-874. A tenant admin never sees this.
@RestController
@RequestMapping("/api/v1/super-user")
@PreAuthorize("hasRole('ADMIN')")
public class SuperUserDashboardController {

    private final SuperUserDashboardService superUserDashboardService;

    public SuperUserDashboardController(SuperUserDashboardService superUserDashboardService) {
        this.superUserDashboardService = superUserDashboardService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<SuperUserDashboardResponse> getDashboard() {
        return ResponseEntity.ok(superUserDashboardService.getDashboard());
    }
}
