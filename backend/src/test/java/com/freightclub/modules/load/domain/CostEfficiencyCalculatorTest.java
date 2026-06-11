package com.freightclub.modules.load.domain;

import com.freightclub.domain.Load;
import com.freightclub.domain.LoadStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

/**
 * US-820: CostEfficiencyCalculator — calculates average cost per mile
 */
class CostEfficiencyCalculatorTest {

  private CostEfficiencyCalculator calculator;

  @BeforeEach
  void setUp() {
    calculator = new CostEfficiencyCalculator();
  }

  @Test
  void testCalculate_SingleLoadCostPerMile() {
    Load load = createLoad("L1", LoadStatus.DELIVERED, new BigDecimal("100.00"), new BigDecimal("50.00"));

    BigDecimal result = calculator.calculate(Collections.singletonList(load));

    assertEquals(new BigDecimal("2.00"), result);
  }

  @Test
  void testCalculate_MultipleLoadsAverageCostPerMile() {
    Load load1 = createLoad("L1", LoadStatus.DELIVERED, new BigDecimal("100.00"), new BigDecimal("50.00"));
    Load load2 = createLoad("L2", LoadStatus.DELIVERED, new BigDecimal("150.00"), new BigDecimal("50.00"));

    BigDecimal result = calculator.calculate(Arrays.asList(load1, load2));

    assertEquals(new BigDecimal("2.50"), result);
  }

  @Test
  void testCalculate_CostPerMileRoundedTo2DecimalPlaces() {
    Load load = createLoad("L1", LoadStatus.DELIVERED, new BigDecimal("100.00"), new BigDecimal("30.00"));

    BigDecimal result = calculator.calculate(Collections.singletonList(load));

    assertEquals(new BigDecimal("3.33"), result);
  }

  @Test
  void testCalculate_FiltersOutNonDeliveredLoads() {
    Load deliveredLoad = createLoad("L1", LoadStatus.DELIVERED, new BigDecimal("100.00"), new BigDecimal("50.00"));
    Load claimedLoad = createLoad("L2", LoadStatus.CLAIMED, new BigDecimal("200.00"), new BigDecimal("100.00"));

    BigDecimal result = calculator.calculate(Arrays.asList(deliveredLoad, claimedLoad));

    assertEquals(new BigDecimal("2.00"), result);
  }

  @Test
  void testCalculate_NoDeliveredLoads_ReturnsNull() {
    Load draftLoad = createLoad("L1", LoadStatus.DRAFT, new BigDecimal("100.00"), new BigDecimal("50.00"));
    Load claimedLoad = createLoad("L2", LoadStatus.CLAIMED, new BigDecimal("150.00"), new BigDecimal("50.00"));

    BigDecimal result = calculator.calculate(Arrays.asList(draftLoad, claimedLoad));

    assertNull(result);
  }

  @Test
  void testCalculate_EmptyLoadList_ReturnsNull() {
    BigDecimal result = calculator.calculate(Collections.emptyList());

    assertNull(result);
  }

  @Test
  void testCalculate_LargeAmounts_MaintainsPrecision() {
    Load load = createLoad("L1", LoadStatus.DELIVERED, new BigDecimal("50000.00"), new BigDecimal("20000.00"));

    BigDecimal result = calculator.calculate(Collections.singletonList(load));

    assertEquals(new BigDecimal("2.50"), result);
  }

  @Test
  void testCalculate_SmallMileage_HighCost() {
    Load load = createLoad("L1", LoadStatus.DELIVERED, new BigDecimal("500.00"), new BigDecimal("10.00"));

    BigDecimal result = calculator.calculate(Collections.singletonList(load));

    assertEquals(new BigDecimal("50.00"), result);
  }

  private Load createLoad(String id, LoadStatus status, BigDecimal costBase, BigDecimal distanceMiles) {
    Load load = new Load();
    load.setStatus(status);
    load.setPayRate(costBase);
    load.setDistanceMiles(distanceMiles);
    return load;
  }
}
