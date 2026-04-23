package com.freightclub.modules.load.domain;

/** Lightweight carrier projection passed to MatchScorer — contains only scoring-relevant fields. */
public record CarrierCandidate(String carrierId, String preferredEquipment, String serviceArea) {}
