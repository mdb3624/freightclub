package com.freightclub.service;

/**
 * Maps a US state code to one of EIA's 5 PADD-based diesel price regions
 * (EAST/MIDWEST/SOUTH/ROCKY/WEST), matching the taxonomy already used by
 * {@link EiaFuelPriceService} (R10/R20/R30/R40/R50).
 *
 * Deliberately separate from Load.stateToRegion(), which serves an
 * unrelated 7-category lane-matching taxonomy for LoadRecommendationService.
 */
public final class StateToEiaRegionResolver {

  private StateToEiaRegionResolver() {}

  public static String resolve(String stateCode) {
    if (stateCode == null || stateCode.isBlank()) {
      return null;
    }
    return switch (stateCode.toUpperCase()) {
      // PADD 1 (East Coast)
      case "CT", "DE", "DC", "FL", "GA", "ME", "MD", "MA", "NH", "NJ",
           "NY", "NC", "PA", "RI", "SC", "VT", "VA", "WV" -> "EAST";
      // PADD 2 (Midwest)
      case "IL", "IN", "IA", "KS", "KY", "MI", "MN", "MO", "NE", "ND",
           "OH", "OK", "SD", "TN", "WI" -> "MIDWEST";
      // PADD 3 (Gulf Coast)
      case "AL", "AR", "LA", "MS", "NM", "TX" -> "SOUTH";
      // PADD 4 (Rocky Mountain)
      case "CO", "ID", "MT", "UT", "WY" -> "ROCKY";
      // PADD 5 (West Coast)
      case "AK", "AZ", "CA", "HI", "NV", "OR", "WA" -> "WEST";
      default -> null;
    };
  }
}
