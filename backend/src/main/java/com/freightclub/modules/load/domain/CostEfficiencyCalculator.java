package com.freightclub.modules.load.domain;

import com.freightclub.domain.Load;
import com.freightclub.domain.LoadStatus;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collection;
import java.util.Objects;

/**
 * CostEfficiencyCalculator: Calculates average cost per mile for delivered loads.
 *
 * AC-3: Cost Per Mile
 * - Filters loads with status = DELIVERED
 * - Calculates: sum(payRate) / sum(distanceMiles)
 * - Rounds to 2 decimal places (e.g., $2.45)
 * - Returns null if no delivered loads exist
 */
public class CostEfficiencyCalculator {

  public BigDecimal calculate(Collection<Load> loads) {
    if (loads == null || loads.isEmpty()) {
      return null;
    }

    // Filter to DELIVERED loads only
    var deliveredLoads = loads.stream()
        .filter(load -> load.getStatus() == LoadStatus.DELIVERED)
        .filter(load -> Objects.nonNull(load.getPayRate()))
        .filter(load -> Objects.nonNull(load.getDistanceMiles()))
        .toList();

    if (deliveredLoads.isEmpty()) {
      return null;
    }

    // Sum all costs and distances
    BigDecimal totalCost = deliveredLoads.stream()
        .map(Load::getPayRate)
        .reduce(BigDecimal.ZERO, BigDecimal::add);

    BigDecimal totalDistance = deliveredLoads.stream()
        .map(Load::getDistanceMiles)
        .reduce(BigDecimal.ZERO, BigDecimal::add);

    if (totalDistance.signum() == 0) {
      return null; // Edge case: no distance
    }

    // Calculate cost per mile
    return totalCost.divide(totalDistance, 2, RoundingMode.HALF_UP);
  }
}
