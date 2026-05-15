package com.freightclub.modules.load.application;

import com.freightclub.modules.load.domain.PayRateType;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class CreateLoadCommandTest {

  @Test
  void constructorInitializesAllFields() {
    BigDecimal weight = new BigDecimal("5000");
    String origin = "CA";
    String dest = "TX";
    BigDecimal rate = new BigDecimal("2.50");
    PayRateType rateType = PayRateType.PER_MILE;
    BigDecimal distance = new BigDecimal("500");

    CreateLoadCommand cmd = new CreateLoadCommand(weight, origin, dest, rate, rateType, distance);

    assertEquals(weight, cmd.weightLbs());
    assertEquals(origin, cmd.originState());
    assertEquals(dest, cmd.destState());
    assertEquals(rate, cmd.payRate());
    assertEquals(rateType, cmd.payRateType());
    assertEquals(distance, cmd.distanceMiles());
  }

  @Test
  void equalsAndHashcodeWorkCorrectly() {
    BigDecimal weight = new BigDecimal("5000");
    CreateLoadCommand cmd1 = new CreateLoadCommand(weight, "CA", "TX", new BigDecimal("2.50"), PayRateType.PER_MILE, new BigDecimal("500"));
    CreateLoadCommand cmd2 = new CreateLoadCommand(weight, "CA", "TX", new BigDecimal("2.50"), PayRateType.PER_MILE, new BigDecimal("500"));

    assertEquals(cmd1, cmd2);
    assertEquals(cmd1.hashCode(), cmd2.hashCode());
  }

  @Test
  void notEqualWhenWeightDiffers() {
    CreateLoadCommand cmd1 = new CreateLoadCommand(new BigDecimal("5000"), "CA", "TX", new BigDecimal("2.50"), PayRateType.PER_MILE, new BigDecimal("500"));
    CreateLoadCommand cmd2 = new CreateLoadCommand(new BigDecimal("6000"), "CA", "TX", new BigDecimal("2.50"), PayRateType.PER_MILE, new BigDecimal("500"));

    assertNotEquals(cmd1, cmd2);
  }

  @Test
  void notEqualWhenOriginStateDiffers() {
    CreateLoadCommand cmd1 = new CreateLoadCommand(new BigDecimal("5000"), "CA", "TX", new BigDecimal("2.50"), PayRateType.PER_MILE, new BigDecimal("500"));
    CreateLoadCommand cmd2 = new CreateLoadCommand(new BigDecimal("5000"), "NY", "TX", new BigDecimal("2.50"), PayRateType.PER_MILE, new BigDecimal("500"));

    assertNotEquals(cmd1, cmd2);
  }

  @Test
  void notEqualWhenDestStateDiffers() {
    CreateLoadCommand cmd1 = new CreateLoadCommand(new BigDecimal("5000"), "CA", "TX", new BigDecimal("2.50"), PayRateType.PER_MILE, new BigDecimal("500"));
    CreateLoadCommand cmd2 = new CreateLoadCommand(new BigDecimal("5000"), "CA", "FL", new BigDecimal("2.50"), PayRateType.PER_MILE, new BigDecimal("500"));

    assertNotEquals(cmd1, cmd2);
  }

  @Test
  void notEqualWhenPayRateDiffers() {
    CreateLoadCommand cmd1 = new CreateLoadCommand(new BigDecimal("5000"), "CA", "TX", new BigDecimal("2.50"), PayRateType.PER_MILE, new BigDecimal("500"));
    CreateLoadCommand cmd2 = new CreateLoadCommand(new BigDecimal("5000"), "CA", "TX", new BigDecimal("3.00"), PayRateType.PER_MILE, new BigDecimal("500"));

    assertNotEquals(cmd1, cmd2);
  }

  @Test
  void notEqualWhenPayRateTypeDiffers() {
    CreateLoadCommand cmd1 = new CreateLoadCommand(new BigDecimal("5000"), "CA", "TX", new BigDecimal("2.50"), PayRateType.PER_MILE, new BigDecimal("500"));
    CreateLoadCommand cmd2 = new CreateLoadCommand(new BigDecimal("5000"), "CA", "TX", new BigDecimal("2.50"), PayRateType.FLAT_RATE, new BigDecimal("500"));

    assertNotEquals(cmd1, cmd2);
  }

  @Test
  void notEqualWhenDistanceDiffers() {
    CreateLoadCommand cmd1 = new CreateLoadCommand(new BigDecimal("5000"), "CA", "TX", new BigDecimal("2.50"), PayRateType.PER_MILE, new BigDecimal("500"));
    CreateLoadCommand cmd2 = new CreateLoadCommand(new BigDecimal("5000"), "CA", "TX", new BigDecimal("2.50"), PayRateType.PER_MILE, new BigDecimal("600"));

    assertNotEquals(cmd1, cmd2);
  }

  @Test
  void toStringContainsAllFields() {
    CreateLoadCommand cmd = new CreateLoadCommand(new BigDecimal("5000"), "CA", "TX", new BigDecimal("2.50"), PayRateType.PER_MILE, new BigDecimal("500"));
    String str = cmd.toString();

    assertTrue(str.contains("5000"));
    assertTrue(str.contains("CA"));
    assertTrue(str.contains("TX"));
    assertTrue(str.contains("2.50"));
    assertTrue(str.contains("500"));
  }

  @Test
  void acceptsNullValues() {
    CreateLoadCommand cmd = new CreateLoadCommand(null, null, null, null, null, null);
    assertNull(cmd.weightLbs());
    assertNull(cmd.originState());
    assertNull(cmd.destState());
    assertNull(cmd.payRate());
    assertNull(cmd.payRateType());
    assertNull(cmd.distanceMiles());
  }
}
