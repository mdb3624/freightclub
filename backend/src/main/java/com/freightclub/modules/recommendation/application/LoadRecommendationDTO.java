package com.freightclub.modules.recommendation.application;

import com.freightclub.modules.recommendation.domain.MatchReason;
import java.time.OffsetDateTime;

public record LoadRecommendationDTO(
    String id,
    String tenantId,
    String loadId,
    String truckerId,
    int matchScore,
    MatchReason matchReason,
    OffsetDateTime createdAt) {}
