package com.freightclub.modules.load.domain;

import com.freightclub.domain.Load;
import com.freightclub.domain.LoadStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

/**
 * US-820: OnTimeRateCalculator — calculates on-time delivery percentage
 * AC-2: On-time = actual_delivery_at <= scheduled_delivery_to
 */
class OnTimeRateCalculatorTest {

  private OnTimeRateCalculator calculator;

  @BeforeEach
  void setUp() {
    calculator = new OnTimeRateCalculator();
  }

  @Test
  void testCalculate_AllLoadsOnTime_Returns100Percent() {
    LocalDateTime scheduled = LocalDateTime.now().plusDays(5);
    LocalDateTime actual = scheduled.minusHours(2); // Delivered early

    Load load1 = createLoad("L1", LoadStatus.DELIVERED, scheduled, actual);
    Load load2 = createLoad("L2", LoadStatus.DELIVERED, scheduled, actual);

    BigDecimal result = calculator.calculate(Arrays.asList(load1, load2));

    assertEquals(new BigDecimal("100.0"), result);
  }

  @Test
  void testCalculate_NoLoadsOnTime_Returns0Percent() {
    LocalDateTime scheduled = LocalDateTime.now().plusDays(5);
    LocalDateTime actual = scheduled.plusHours(2); // Delivered late

    Load load1 = createLoad("L1", LoadStatus.DELIVERED, scheduled, actual);
    Load load2 = createLoad("L2", LoadStatus.DELIVERED, scheduled, actual);

    BigDecimal result = calculator.calculate(Arrays.asList(load1, load2));

    assertEquals(new BigDecimal("0.0"), result);
  }

  @Test
  void testCalculate_PartialOnTime_Returns50Percent() {
    LocalDateTime scheduled = LocalDateTime.now().plusDays(5);
    LocalDateTime onTimeActual = scheduled.minusHours(1);
    LocalDateTime lateActual = scheduled.plusHours(1);

    Load onTimeLoad = createLoad("L1", LoadStatus.DELIVERED, scheduled, onTimeActual);
    Load lateLoad = createLoad("L2", LoadStatus.DELIVERED, scheduled, lateActual);

    BigDecimal result = calculator.calculate(Arrays.asList(onTimeLoad, lateLoad));

    assertEquals(new BigDecimal("50.0"), result);
  }

  @Test
  void testCalculate_ExactDeliveryTime_IsOnTime() {
    LocalDateTime scheduled = LocalDateTime.now().plusDays(5);
    LocalDateTime actual = scheduled;

    Load load = createLoad("L1", LoadStatus.DELIVERED, scheduled, actual);

    BigDecimal result = calculator.calculate(Collections.singletonList(load));

    assertEquals(new BigDecimal("100.0"), result);
  }

  @Test
  void testCalculate_OnTimePercentageRoundedTo1DecimalPlace() {
    // 1 on-time out of 3 = 33.333...% → 33.3%
    LocalDateTime scheduled = LocalDateTime.now().plusDays(5);
    LocalDateTime onTimeActual = scheduled.minusHours(1);
    LocalDateTime lateActual = scheduled.plusHours(1);

    Load onTimeLoad = createLoad("L1", LoadStatus.DELIVERED, scheduled, onTimeActual);
    Load lateLoad2 = createLoad("L2", LoadStatus.DELIVERED, scheduled, lateActual);
    Load lateLoad3 = createLoad("L3", LoadStatus.DELIVERED, scheduled, lateActual);

    BigDecimal result = calculator.calculate(
        Arrays.asList(onTimeLoad, lateLoad2, lateLoad3)
    );

    assertEquals(new BigDecimal("33.3"), result);
  }

  @Test
  void testCalculate_NoDeliveredLoads_ReturnsNull() {
    LocalDateTime scheduled = LocalDateTime.now().plusDays(5);

    Load draftLoad = createLoad("L1", LoadStatus.DRAFT, scheduled, null);
    Load claimedLoad = createLoad("L2", LoadStatus.CLAIMED, scheduled, null);

    BigDecimal result = calculator.calculate(Arrays.asList(draftLoad, claimedLoad));

    assertNull(result);
  }

  @Test
  void testCalculate_EmptyLoadList_ReturnsNull() {
    BigDecimal result = calculator.calculate(Collections.emptyList());

    assertNull(result);
  }

  @Test
  void testCalculate_FiltersOutNonDeliveredLoads() {
    LocalDateTime scheduled = LocalDateTime.now().plusDays(5);
    LocalDateTime onTimeActual = scheduled.minusHours(1);

    Load deliveredOnTime = createLoad("L1", LoadStatus.DELIVERED, scheduled, onTimeActual);
    Load claimedLoad = createLoad("L2", LoadStatus.CLAIMED, scheduled, null);
    Load draftLoad = createLoad("L3", LoadStatus.DRAFT, scheduled, null);
    Load cancelledLoad = createLoad("L4", LoadStatus.CANCELLED, scheduled, null);

    BigDecimal result = calculator.calculate(
        Arrays.asList(deliveredOnTime, claimedLoad, draftLoad, cancelledLoad)
    );

    assertEquals(new BigDecimal("100.0"), result);
  }

  private Load createLoad(
      String id,
      LoadStatus status,
      LocalDateTime scheduledDeliveryTo,
      LocalDateTime deliveredAt
  ) {
    Load load = new Load();
    load.setStatus(status);
    load.setDeliveryTo(scheduledDeliveryTo);
    load.setDeliveredAt(deliveredAt);
    return load;
  }
}
