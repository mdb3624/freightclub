package com.freightclub.modules.recommendation.application;

import com.freightclub.domain.CarrierEquipment;
import com.freightclub.domain.CarrierLane;
import com.freightclub.domain.Load;
import com.freightclub.modules.recommendation.domain.LoadRecommendation;
import com.freightclub.modules.recommendation.domain.MatchReason;
import com.freightclub.security.TenantContextHolder;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@Transactional
public class LoadRecommendationService {

  // AC-1: Equipment match scores 100 points
  private static final int EQUIPMENT_MATCH_SCORE = 100;
  // AC-2: Lane match scores 50 points
  private static final int LANE_MATCH_SCORE = 50;
  // AC-3: Rate match scores 25 points
  private static final int RATE_MATCH_SCORE = 25;
  // AC-4: Availability match scores 25 points
  private static final int AVAILABILITY_MATCH_SCORE = 25;

  // Generates recommendation from Load + CarrierEquipment only
  public LoadRecommendation generateRecommendation(Load load, CarrierEquipment equipment) {
    return generateRecommendation(load, equipment, null);
  }

  // Generates recommendation from Load + CarrierEquipment + CarrierLane
  public LoadRecommendation generateRecommendation(
      Load load, CarrierEquipment equipment, CarrierLane lane) {

    // AC-6: Cross-tenant validation (AccessDeniedException)
    String tenantId = TenantContextHolder.getTenantId();
    if (!load.getTenantId().equals(tenantId) || !equipment.getTenantId().equals(tenantId)
        || (lane != null && !lane.getTenantId().equals(tenantId))) {
      throw new AccessDeniedException("Cross-tenant recommendation generation not allowed");
    }

    int score = 0;
    boolean equipmentMatch = false;
    boolean laneMatch = false;
    boolean rateMatch = false;
    boolean availabilityMatch = false;

    // AC-1: Equipment matching (100 points for exact match)
    if (load.getEquipmentType() != null
        && load.getEquipmentType().equals(equipment.getEquipmentType())) {
      score += EQUIPMENT_MATCH_SCORE;
      equipmentMatch = true;
    }

    // AC-2: Lane matching (50 points for origin/dest match)
    if (lane != null
        && load.getOriginRegion() != null && load.getOriginRegion().equals(lane.getOriginRegion())
        && load.getDestRegion() != null && load.getDestRegion().equals(lane.getDestinationRegion())) {
      score += LANE_MATCH_SCORE;
      laneMatch = true;
    }

    // AC-3: Rate matching (25 points if load rate >= min rate)
    if (lane != null && load.getPayRate() != null && lane.getMinRateCents() != null) {
      BigDecimal minRate = BigDecimal.valueOf(lane.getMinRateCents()).divide(BigDecimal.valueOf(100));
      if (load.getPayRate().compareTo(minRate) >= 0) {
        score += RATE_MATCH_SCORE;
        rateMatch = true;
      }
    }

    // AC-4: Availability matching (25 points for availability within window)
    if (load.getPickupFrom() != null) {
      availabilityMatch = isAvailable(load.getPickupFrom());
      if (availabilityMatch) {
        score += AVAILABILITY_MATCH_SCORE;
      }
    }

    MatchReason reason = new MatchReason(equipmentMatch, laneMatch, rateMatch, availabilityMatch);
    return LoadRecommendation.createRecommendation(
        tenantId, load.getId(), equipment.getTruckerId(), Math.max(score, 1), reason);
  }

  private boolean isAvailable(LocalDateTime pickupTime) {
    if (pickupTime == null) return false;
    // Simple heuristic: available if pickup is within next 30 days
    LocalDateTime now = LocalDateTime.now();
    return pickupTime.isAfter(now) && pickupTime.isBefore(now.plusDays(30));
  }
}
