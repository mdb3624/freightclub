package com.freightclub.modules.carrier.application;

import java.util.List;

// US-762: result shape for the lane-based carrier search panel (origin/destination/equipmentType).
// Distinct from CarrierSearchResult (US-707-v2 name/email search) to avoid breaking that shipped contract.
public record CarrierLaneSearchResult(
        String id,
        String companyName,
        String email,
        List<String> equipmentTypes,
        Double onTimePct,
        List<CarrierLaneDTO> lanes
) {}
