package com.freightclub.modules.load.application;

import com.freightclub.modules.load.application.ports.out.CarrierSearchPort;
import com.freightclub.modules.load.application.ports.out.MatchRecommendationPort;
import com.freightclub.modules.load.domain.CarrierCandidate;
import com.freightclub.modules.load.domain.LoadPublishedEvent;
import com.freightclub.modules.load.domain.MatchCriteria;
import com.freightclub.modules.load.domain.MatchRecommendation;
import com.freightclub.modules.load.domain.MatchScorer;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class MatchDiscoveryService {

    private final CarrierSearchPort carrierSearchPort;
    private final MatchRecommendationPort matchRecommendationPort;
    private final MatchScorer matchScorer;

    public MatchDiscoveryService(CarrierSearchPort carrierSearchPort,
                                 MatchRecommendationPort matchRecommendationPort,
                                 MatchScorer matchScorer) {
        this.carrierSearchPort = carrierSearchPort;
        this.matchRecommendationPort = matchRecommendationPort;
        this.matchScorer = matchScorer;
    }

    public void processLoadPublished(LoadPublishedEvent event) {
        if (event.equipmentType() == null || event.originCity() == null) {
            return;
        }

        MatchCriteria criteria = new MatchCriteria(
                event.tenantId(), event.equipmentType(), event.originCity());

        List<CarrierCandidate> candidates = carrierSearchPort.findCandidates(event.tenantId());

        candidates.forEach(candidate -> {
            int score = matchScorer.calculateScore(criteria, candidate);
            if (score > 0) {
                matchRecommendationPort.save(
                        new MatchRecommendation(event.loadId(), event.tenantId(), candidate.carrierId(), score));
            }
        });
    }
}
