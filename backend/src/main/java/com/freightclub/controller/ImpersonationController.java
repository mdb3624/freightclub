package com.freightclub.controller;

import com.freightclub.dto.EndImpersonationRequest;
import com.freightclub.dto.ImpersonationStartResponse;
import com.freightclub.dto.StartImpersonationRequest;
import com.freightclub.security.ImpersonationContextHolder;
import com.freightclub.service.ImpersonationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// US-885: /start requires a real Super User session (ROLE_ADMIN, same gate as every other
// Super User surface). /end is deliberately NOT role-gated the same way — while impersonating,
// the request is authenticated AS the target user (whatever persona role that is), so the
// authorization check there is "is an impersonation actually active" (ImpersonationContextHolder,
// set by JwtAuthenticationFilter from the impersonation token's own claims), not a role check.
@RestController
@RequestMapping("/api/v1/super-user/impersonation")
public class ImpersonationController {

    private final ImpersonationService impersonationService;

    public ImpersonationController(ImpersonationService impersonationService) {
        this.impersonationService = impersonationService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/start")
    public ResponseEntity<ImpersonationStartResponse> start(@AuthenticationPrincipal String actorUserId,
                                                              @Valid @RequestBody StartImpersonationRequest request) {
        ImpersonationStartResponse response = impersonationService.start(
                actorUserId, request.targetUserId(), request.reason(), request.password());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/end")
    public ResponseEntity<Void> end(@Valid @RequestBody EndImpersonationRequest request) {
        if (!ImpersonationContextHolder.isActive()) {
            throw new AccessDeniedException("No active impersonation session");
        }
        impersonationService.end(ImpersonationContextHolder.getSuperUserId(), request.sessionId());
        return ResponseEntity.noContent().build();
    }
}
