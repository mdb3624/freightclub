package com.freightclub.dto;

import com.freightclub.domain.LoadEvent;

import java.time.LocalDateTime;

public record LoadEventResponse(
        String id,
        String eventType,
        String actorId,
        String note,
        LocalDateTime createdAt
) {
    public static LoadEventResponse from(LoadEvent e) {
        return new LoadEventResponse(
                e.getId(),
                e.getEventType(),
                e.getActorId(),
                e.getNote(),
                e.getCreatedAt()
        );
    }
}
