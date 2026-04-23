package com.freightclub.modules.load.domain;

/** Strategy for scoring a carrier candidate against a load's match criteria. */
public interface MatchScorer {

    /** Returns a score ≥ 0. A score of 0 means no match; higher means better fit. */
    int calculateScore(MatchCriteria criteria, CarrierCandidate candidate);
}
