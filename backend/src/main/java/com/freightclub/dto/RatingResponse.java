package com.freightclub.dto;

import com.freightclub.domain.Rating;
import com.freightclub.domain.UserRole;

import java.time.LocalDateTime;

public record RatingResponse(
        String id,
        String loadId,
        String reviewerId,
        String reviewedId,
        UserRole reviewerRole,
        int stars,
        String comment,
        LocalDateTime createdAt
) {
    public static RatingResponse from(Rating r) {
        return new RatingResponse(
                r.getId(), r.getLoadId(), r.getReviewerId(), r.getReviewedId(),
                r.getReviewerRole(), r.getStars(), r.getComment(), r.getCreatedAt());
    }
}
