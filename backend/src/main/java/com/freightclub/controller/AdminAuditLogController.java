package com.freightclub.controller;

import com.freightclub.dto.AuditLogEntryResponse;
import com.freightclub.service.AdminAuditLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// US-880: gated ROLE_ADMIN (Super User), same platform-wide role as the rest of the
// /api/v1/super-user/* surface.
@RestController
@RequestMapping("/api/v1/super-user/audit-log")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAuditLogController {

    private final AdminAuditLogService adminAuditLogService;

    public AdminAuditLogController(AdminAuditLogService adminAuditLogService) {
        this.adminAuditLogService = adminAuditLogService;
    }

    @GetMapping
    public ResponseEntity<List<AuditLogEntryResponse>> list(@RequestParam(required = false) String targetId) {
        return ResponseEntity.ok(adminAuditLogService.list(targetId));
    }
}
