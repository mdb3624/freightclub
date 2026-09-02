package com.freightclub.dto;

import com.freightclub.domain.User;

import java.time.LocalDateTime;

// US-875/877: shared response shape for Shipper Admin and Carrier Admin team management —
// persona-agnostic per the ARCHITECT reuse flag in both story docs (identical mechanics,
// only the persona theme rendering it differs on the frontend).
public record TeamMemberResponse(
        String id,
        String email,
        String firstName,
        String lastName,
        boolean isTenantAdmin,
        LocalDateTime joinedAt
) {
    public static TeamMemberResponse from(User user) {
        return new TeamMemberResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.isTenantAdmin(),
                user.getCreatedAt()
        );
    }
}
