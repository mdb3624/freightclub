package com.freightclub.modules.recommendation.domain;

import java.util.Objects;

public record MatchReason(
    boolean equipment,
    boolean lane,
    boolean rate,
    boolean availability) {

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    MatchReason that = (MatchReason) o;
    return equipment == that.equipment
        && lane == that.lane
        && rate == that.rate
        && availability == that.availability;
  }

  @Override
  public int hashCode() {
    return Objects.hash(equipment, lane, rate, availability);
  }
}
