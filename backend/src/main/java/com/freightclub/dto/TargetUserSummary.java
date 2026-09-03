package com.freightclub.dto;

public record TargetUserSummary(
        String id,
        String email,
        String firstName,
        String lastName,
        String role
) {}
