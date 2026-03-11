package com.freightclub.dto;

import com.freightclub.domain.User;

public record UserResponse(
        String id,
        String email,
        String firstName,
        String lastName,
        String role,
        String tenantId
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole().name(),
                user.getTenantId()
        );
    }
}
