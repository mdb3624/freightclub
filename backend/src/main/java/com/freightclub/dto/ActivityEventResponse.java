package com.freightclub.dto;

import java.time.LocalDateTime;

// US-882: one row in a user's merged activity view — either a login event (proxied by
// refresh-token issuance, since no dedicated login-event tracking exists) or a US-880 audit
// log entry where this user was the target of a Super User action.
public record ActivityEventResponse(
        String eventType,
        String description,
        LocalDateTime occurredAt
) {}
