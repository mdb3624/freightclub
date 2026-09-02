package com.freightclub.controller;

import com.freightclub.dto.ActivityEventResponse;
import com.freightclub.dto.ForcePasswordResetResponse;
import com.freightclub.dto.SuperUserActionRequest;
import com.freightclub.service.SuperUserAccountManagementService;
import com.freightclub.service.SuperUserActivityService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// US-881: gated ROLE_ADMIN (Super User), same platform-wide role as the rest of
// /api/v1/super-user/*.
@RestController
@RequestMapping("/api/v1/super-user/users")
@PreAuthorize("hasRole('ADMIN')")
public class SuperUserAccountManagementController {

    private final SuperUserAccountManagementService superUserAccountManagementService;
    private final SuperUserActivityService superUserActivityService;

    public SuperUserAccountManagementController(SuperUserAccountManagementService superUserAccountManagementService,
                                                  SuperUserActivityService superUserActivityService) {
        this.superUserAccountManagementService = superUserAccountManagementService;
        this.superUserActivityService = superUserActivityService;
    }

    @GetMapping("/{userId}/activity")
    public ResponseEntity<List<ActivityEventResponse>> activity(@PathVariable String userId) {
        return ResponseEntity.ok(superUserActivityService.getActivity(userId));
    }

    @PostMapping("/{userId}/suspend")
    public ResponseEntity<Void> suspend(@AuthenticationPrincipal String actorUserId,
                                         @PathVariable String userId,
                                         @Valid @RequestBody SuperUserActionRequest request) {
        superUserAccountManagementService.suspendUser(actorUserId, userId, request.reason());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{userId}/reactivate")
    public ResponseEntity<Void> reactivate(@AuthenticationPrincipal String actorUserId,
                                            @PathVariable String userId,
                                            @Valid @RequestBody SuperUserActionRequest request) {
        superUserAccountManagementService.reactivateUser(actorUserId, userId, request.reason());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{userId}/force-password-reset")
    public ResponseEntity<ForcePasswordResetResponse> forcePasswordReset(@AuthenticationPrincipal String actorUserId,
                                                                          @PathVariable String userId,
                                                                          @Valid @RequestBody SuperUserActionRequest request) {
        String token = superUserAccountManagementService.forcePasswordReset(actorUserId, userId, request.reason());
        return ResponseEntity.ok(new ForcePasswordResetResponse(token));
    }
}
