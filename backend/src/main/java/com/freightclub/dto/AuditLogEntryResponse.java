package com.freightclub.dto;

import java.time.LocalDateTime;

// US-880
public record AuditLogEntryResponse(
        String id,
        String actorUserId,
        String actionType,
        String targetId,
        String reason,
        LocalDateTime createdAt
) {}
