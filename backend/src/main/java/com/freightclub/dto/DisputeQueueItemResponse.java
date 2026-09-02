package com.freightclub.dto;

import java.time.LocalDateTime;

// US-751 BR-2: enough context to resolve without leaving the tool — load, both parties
// (via tenant names), and the stated reason.
public record DisputeQueueItemResponse(
        String id,
        String loadId,
        String tenantName,
        String raisedByEmail,
        String reason,
        String status,
        LocalDateTime createdAt
) {}
