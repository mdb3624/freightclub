package com.freightclub.modules.load.application.ports.out;

import com.freightclub.modules.load.domain.CarrierCandidate;

import java.util.List;

public interface CarrierSearchPort {

    /** Returns all active carrier candidates for a tenant. Scoring is the caller's responsibility. */
    List<CarrierCandidate> findCandidates(String tenantId);
}
