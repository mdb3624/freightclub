package com.freightclub.controller;

import com.freightclub.dto.PlatformHealthResponse;
import com.freightclub.service.PlatformHealthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// US-752: gated ROLE_ADMIN (Super User) — same platform-wide role as the dashboard/dispute
// surfaces.
@RestController
@RequestMapping("/api/v1/super-user")
@PreAuthorize("hasRole('ADMIN')")
public class PlatformHealthController {

    private final PlatformHealthService platformHealthService;

    public PlatformHealthController(PlatformHealthService platformHealthService) {
        this.platformHealthService = platformHealthService;
    }

    @GetMapping("/health")
    public ResponseEntity<PlatformHealthResponse> getHealth() {
        return ResponseEntity.ok(platformHealthService.getHealth());
    }
}
