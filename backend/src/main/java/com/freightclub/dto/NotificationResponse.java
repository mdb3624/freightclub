package com.freightclub.dto;

import com.freightclub.domain.Notification;

import java.time.LocalDateTime;

public record NotificationResponse(
        String id,
        String loadId,
        String type,
        String message,
        boolean read,
        LocalDateTime createdAt
) {
    public static NotificationResponse from(Notification n) {
        return new NotificationResponse(
                n.getId(),
                n.getLoadId(),
                n.getType(),
                n.getMessage(),
                n.isRead(),
                n.getCreatedAt()
        );
    }
}
