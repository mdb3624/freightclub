package com.freightclub.modules.load.domain;

import com.freightclub.domain.Load;
import com.freightclub.domain.LoadStatus;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collection;
import java.util.Objects;

/**
 * OnTimeRateCalculator: Calculates the on-time delivery percentage.
 *
 * AC-2: On-Time Delivery Rate
 * - Filters loads with status = DELIVERED
 * - Calculates: (on_time_count / delivered_count) * 100
 * - Rounds to 1 decimal place (e.g., 94.5%)
 * - On-time = deliveredAt <= deliveryTo
 * - Returns null if no delivered loads exist
 */
@Service
public class OnTimeRateCalculator {

  public BigDecimal calculate(Collection<Load> loads) {
    if (loads == null || loads.isEmpty()) {
      return null;
    }

    // Filter to DELIVERED loads with actual delivery time
    var deliveredLoads = loads.stream()
        .filter(load -> load.getStatus() == LoadStatus.DELIVERED)
        .filter(load -> Objects.nonNull(load.getDeliveredAt()))
        .toList();

    if (deliveredLoads.isEmpty()) {
      return null;
    }

    // Count on-time deliveries (deliveredAt <= deliveryTo)
    long onTimeCount = deliveredLoads.stream()
        .filter(load -> load.getDeliveredAt().compareTo(load.getDeliveryTo()) <= 0)
        .count();

    // Calculate percentage
    BigDecimal percentage = BigDecimal.valueOf(onTimeCount)
        .multiply(BigDecimal.valueOf(100))
        .divide(BigDecimal.valueOf(deliveredLoads.size()), 1, RoundingMode.HALF_UP);

    return percentage;
  }
}
