package com.freightclub.controller;

import com.freightclub.dto.CreateRatingRequest;
import com.freightclub.dto.RatingResponse;
import com.freightclub.dto.RatingSummaryResponse;
import com.freightclub.dto.ShipperPublicProfileResponse;
import com.freightclub.service.RatingService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ratings")
public class RatingController {

    private final RatingService ratingService;

    public RatingController(RatingService ratingService) {
        this.ratingService = ratingService;
    }

    /** Shipper rates the trucker for a completed load. */
    @PostMapping("/{loadId}/trucker")
    public RatingResponse rateTrucker(@PathVariable String loadId,
                                      @Valid @RequestBody CreateRatingRequest req,
                                      @AuthenticationPrincipal String userId) {
        return ratingService.rateTrucker(loadId, userId, req);
    }

    /** Trucker rates the shipper for a completed load. */
    @PostMapping("/{loadId}/shipper")
    public RatingResponse rateShipper(@PathVariable String loadId,
                                      @Valid @RequestBody CreateRatingRequest req,
                                      @AuthenticationPrincipal String userId) {
        return ratingService.rateShipper(loadId, userId, req);
    }

    /** Check whether the current user has already rated a specific load. */
    @GetMapping("/{loadId}/mine")
    public ResponseEntity<RatingResponse> getMyRating(@PathVariable String loadId,
                                                       @AuthenticationPrincipal String userId) {
        return ratingService.getMyRatingForLoad(loadId, userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    /** Paginated list of ratings the current user has received. */
    @GetMapping("/my-received")
    public Page<RatingResponse> getMyReceived(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal String userId) {
        return ratingService.getMyRatingsReceived(userId, page, size);
    }

    /** Rating summary for the currently authenticated user (role-aware). */
    @GetMapping("/my-summary")
    public RatingSummaryResponse getMySummary(@AuthenticationPrincipal String userId) {
        boolean isTrucker = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().contains(new SimpleGrantedAuthority("ROLE_TRUCKER"));
        return isTrucker
                ? ratingService.getTruckerSummary(userId)
                : ratingService.getShipperSummary(userId);
    }

    /** Public rating summary for any trucker (visible to shippers). */
    @GetMapping("/trucker/{userId}/summary")
    public RatingSummaryResponse getTruckerSummary(@PathVariable String userId) {
        return ratingService.getTruckerSummary(userId);
    }

    /** Public reputation profile for any shipper (visible to truckers). */
    @GetMapping("/shipper/{userId}/profile")
    public ShipperPublicProfileResponse getShipperProfile(@PathVariable String userId) {
        return ratingService.getShipperPublicProfile(userId);
    }
}
