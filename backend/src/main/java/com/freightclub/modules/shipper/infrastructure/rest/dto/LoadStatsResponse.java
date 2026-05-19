package com.freightclub.modules.shipper.infrastructure.rest.dto;

/**
 * Shipper dashboard load statistics response DTO.
 * Provides status counts (OPEN, CLAIMED, IN_TRANSIT, DELIVERED, DRAFT, CANCELLED)
 * with optional active/all views (AC: US-715).
 */
public record LoadStatsResponse(
  StatusCounts active,
  StatusCounts all
) {
  public record StatusCounts(
    int open,
    int claimed,
    int inTransit,
    int delivered,
    int draft,
    int cancelled
  ) {
    /**
     * Factory for active loads (excludes draft/cancelled).
     */
    public static StatusCounts of(int open, int claimed, int inTransit, int delivered) {
      return new StatusCounts(open, claimed, inTransit, delivered, 0, 0);
    }

    /**
     * Factory for all loads (includes draft/cancelled).
     */
    public static StatusCounts of(int open, int claimed, int inTransit, int delivered, int draft, int cancelled) {
      return new StatusCounts(open, claimed, inTransit, delivered, draft, cancelled);
    }
  }

  /**
   * Builds LoadStatsResponse with conditional view inclusion.
   *
   * @param active active load counts (never null)
   * @param all    all load counts (nullable, included only if view="all")
   * @param view   "active" or "all" to control which view is included
   * @return LoadStatsResponse with selected view(s)
   */
  public static LoadStatsResponse of(StatusCounts active, StatusCounts all, String view) {
    if ("all".equals(view)) {
      return new LoadStatsResponse(active, all);
    }
    return new LoadStatsResponse(active, null);
  }
}
