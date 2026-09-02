package com.freightclub.service;

import com.freightclub.domain.RefreshToken;
import com.freightclub.dto.ActivityEventResponse;
import com.freightclub.repository.RefreshTokenRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

// US-882: read-only, merges two existing data sources — no new tracking infrastructure.
// Login events are proxied by refresh-token issuance (a new one is minted on every successful
// login/register); audit entries come from US-880's admin_audit_log where this user is the
// target of a prior Super User action.
@Service
public class SuperUserActivityService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final AdminAuditLogService adminAuditLogService;

    public SuperUserActivityService(RefreshTokenRepository refreshTokenRepository,
                                     AdminAuditLogService adminAuditLogService) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.adminAuditLogService = adminAuditLogService;
    }

    public List<ActivityEventResponse> getActivity(String userId) {
        List<ActivityEventResponse> events = new ArrayList<>();

        for (RefreshToken token : refreshTokenRepository.findAllByUserIdOrderByCreatedAtDesc(userId)) {
            events.add(new ActivityEventResponse("LOGIN", "Logged in", token.getCreatedAt()));
        }

        for (var entry : adminAuditLogService.list(userId)) {
            events.add(new ActivityEventResponse(entry.actionType(), entry.reason(), entry.createdAt()));
        }

        events.sort(Comparator.comparing(ActivityEventResponse::occurredAt).reversed());
        return events;
    }
}
