package com.freightclub.modules.analytics.domain;

public record MatchReasonDistribution(
    int equipmentCount,
    int laneCount,
    int rateCount,
    int availabilityCount) {}
