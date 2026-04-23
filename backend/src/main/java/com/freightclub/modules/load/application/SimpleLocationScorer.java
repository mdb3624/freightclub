package com.freightclub.modules.load.application;

import com.freightclub.modules.load.domain.CarrierCandidate;
import com.freightclub.modules.load.domain.MatchCriteria;
import com.freightclub.modules.load.domain.MatchScorer;
import org.springframework.stereotype.Component;

/** Awards 100 points when equipment type and service area both match; 0 otherwise. */
@Component
public class SimpleLocationScorer implements MatchScorer {

    @Override
    public int calculateScore(MatchCriteria criteria, CarrierCandidate candidate) {
        boolean equipmentMatch = criteria.equipmentType().equalsIgnoreCase(candidate.preferredEquipment());
        boolean cityMatch = criteria.originCity().equalsIgnoreCase(candidate.serviceArea());
        return (equipmentMatch && cityMatch) ? 100 : 0;
    }
}
