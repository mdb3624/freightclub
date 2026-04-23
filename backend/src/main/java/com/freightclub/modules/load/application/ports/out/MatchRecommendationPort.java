package com.freightclub.modules.load.application.ports.out;

import com.freightclub.modules.load.domain.MatchRecommendation;

public interface MatchRecommendationPort {

    void save(MatchRecommendation recommendation);
}
