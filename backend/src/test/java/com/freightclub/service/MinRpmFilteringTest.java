package com.freightclub.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.freightclub.domain.*;
import com.freightclub.dto.*;
import com.freightclub.modules.carrier.application.CarrierCostProfileService;
import com.freightclub.modules.carrier.domain.CarrierCostProfile;
import com.freightclub.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@ExtendWith(MockitoExtension.class)
class MinRpmFilteringTest {

    @Mock private LoadRepository loadRepository;
    @Mock private UserRepository userRepository;
    @Mock private CarrierCostProfileService carrierCostProfileService;
    @Mock private RatingService ratingService; // Added to fix NullPointerException
    
    @InjectMocks
    private LoadService loadService;

    private final String truckerId = "trucker-123";

    @BeforeEach
    void setUp() {
        // US-854: listOpenLoads now fetches the profile once via
        // getCostProfile() and computes minRpm per-load, instead of calling
        // the single-value calculateMinimumRPM(truckerId) orchestration
        // method. Mock a legacy (non-wizard) profile whose
        // calculateMinimumRPM() resolves to the same 0.94 this test
        // originally exercised at the orchestration layer.
        CarrierCostProfile legacyProfile = mock(CarrierCostProfile.class);
        lenient().when(legacyProfile.hasWizardFields()).thenReturn(false);
        lenient().when(legacyProfile.calculateMinimumRPM()).thenReturn(new BigDecimal("0.94"));
        lenient().when(carrierCostProfileService.getCostProfile(truckerId)).thenReturn(legacyProfile);

        // Mock the rating service to return empty summaries to avoid NPE
        lenient().when(ratingService.getShipperRatingSummaries(anySet()))
            .thenReturn(Collections.emptyMap());
    }

    @Test
    void testMinRpmFiltering_ExcludesLoadsBelowMinRpm() {
        Load lowRpmLoad = createMockLoad(new BigDecimal("0.50"));
        Load highRpmLoad = createMockLoad(new BigDecimal("1.50"));

        Page<Load> allLoads = new PageImpl<>(List.of(lowRpmLoad, highRpmLoad));
        
        when(loadRepository.findAll(any(Specification.class), any(Pageable.class)))
            .thenReturn(allLoads);

        LoadBoardFilter filter = new LoadBoardFilter(null, null, null, null, null, null, null);
        Page<LoadSummaryResponse> results = loadService.listOpenLoads(truckerId, filter, 0, 20);

        // Verify filtering logic[cite: 1]
        assertThat(results.getContent()).hasSize(1);
        assertThat(results.getContent().get(0).payRate()).isEqualByComparingTo("1.50");
    }

    @Test
    void testMinRpmFiltering_IncludesLoadsAtOrAboveMinRpm() {
        List<BigDecimal> rates = List.of(new BigDecimal("0.94"), new BigDecimal("1.00"), new BigDecimal("1.50"));
        List<Load> loads = rates.stream().map(this::createMockLoad).collect(Collectors.toList());

        Page<Load> allLoads = new PageImpl<>(loads);
        when(loadRepository.findAll(any(Specification.class), any(Pageable.class)))
            .thenReturn(allLoads);

        LoadBoardFilter filter = new LoadBoardFilter(null, null, null, null, null, null, null);
        Page<LoadSummaryResponse> results = loadService.listOpenLoads(truckerId, filter, 0, 20);

        // Verify inclusion logic[cite: 1]
        assertThat(results.getContent()).hasSize(3);
        assertThat(results.getContent()).allMatch(l -> l.payRate().compareTo(new BigDecimal("0.94")) >= 0);
    }

    private Load createMockLoad(BigDecimal rate) {
        Load load = new Load();
        load.setPayRate(rate); //
        load.setStatus(LoadStatus.OPEN);
        load.setOriginCity("City");
        load.setOriginState("CA");
        load.setDestinationCity("Dest");
        load.setDestinationState("TX"); //[cite: 2]
        load.setShipperId("shipper-1"); // Added for RatingService mock mapping
        return load;
    }
}