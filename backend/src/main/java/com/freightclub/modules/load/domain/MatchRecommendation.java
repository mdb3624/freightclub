package com.freightclub.modules.load.domain;

public record MatchRecommendation(
        String loadId,
        String tenantId,
        String carrierId,
        int matchScore
) {
    public MatchRecommendation {
        if (loadId == null || loadId.isBlank())
            throw new LoadDomainException("MatchRecommendation requires a non-blank loadId");
        if (tenantId == null || tenantId.isBlank())
            throw new LoadDomainException("MatchRecommendation requires a non-blank tenantId");
        if (carrierId == null || carrierId.isBlank())
            throw new LoadDomainException("MatchRecommendation requires a non-blank carrierId");
        if (matchScore < 0)
            throw new LoadDomainException("matchScore must be >= 0");
    }
}
