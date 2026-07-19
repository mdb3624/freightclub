package com.freightclub.modules.carrier.application;

import com.freightclub.domain.EquipmentType;
import com.freightclub.domain.User;
import com.freightclub.domain.UserRole;
import com.freightclub.modules.carrier.domain.CarrierLane;
import com.freightclub.modules.carrier.domain.FrequencyPreference;
import com.freightclub.modules.carrier.domain.LaneStatus;
import com.freightclub.modules.carrier.infrastructure.CarrierLaneEntity;
import com.freightclub.modules.carrier.infrastructure.CarrierLaneRepository;
import com.freightclub.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageRequest;

import java.time.OffsetDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

// AC-v2-2, AC-v2-7: CarrierSearchService unit tests
class CarrierSearchServiceTest {

    private UserRepository userRepository;
    private CarrierLaneRepository laneRepository;
    private CarrierMapper mapper;
    private CarrierSearchService service;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        laneRepository = mock(CarrierLaneRepository.class);
        mapper = mock(CarrierMapper.class);
        service = new CarrierSearchService(userRepository, laneRepository, mapper);
        when(laneRepository.findByTenantIdAndTruckerIdInAndDeletedAtIsNull(any(), any()))
                .thenReturn(List.of());
    }

    @Test
    void searchCarriers_returnsMatchingTruckers() {
        String tenantId = "tenant-1";
        User trucker = makeTrucker("id-1", "Mike", "Johnson", "mike@example.com", EquipmentType.FLATBED);
        when(userRepository.searchTruckers(eq(tenantId), eq("Mike"), any(PageRequest.class)))
                .thenReturn(List.of(trucker));

        List<CarrierSearchResult> results = service.searchCarriers(tenantId, "Mike");

        assertThat(results).hasSize(1);
        assertThat(results.get(0).id()).isEqualTo("id-1");
        assertThat(results.get(0).firstName()).isEqualTo("Mike");
        assertThat(results.get(0).equipmentType()).isEqualTo("FLATBED");
    }

    @Test
    void searchCarriers_returnsEmpty_whenQueryTooShort() {
        List<CarrierSearchResult> results = service.searchCarriers("tenant-1", "M");

        assertThat(results).isEmpty();
        verify(userRepository, never()).searchTruckers(any(), any(), any());
    }

    @Test
    void searchCarriers_returnsEmpty_whenNullQuery() {
        List<CarrierSearchResult> results = service.searchCarriers("tenant-1", null);

        assertThat(results).isEmpty();
        verify(userRepository, never()).searchTruckers(any(), any(), any());
    }

    @Test
    void searchCarriers_mapsNullEquipmentType() {
        User trucker = makeTrucker("id-2", "Jane", "Smith", "jane@test.com", null);
        when(userRepository.searchTruckers(any(), any(), any())).thenReturn(List.of(trucker));

        List<CarrierSearchResult> results = service.searchCarriers("tenant-1", "Jane");

        assertThat(results.get(0).equipmentType()).isNull();
    }

    @Test
    void searchCarriers_stripsWhitespaceFromQuery() {
        when(userRepository.searchTruckers(any(), eq("Mike"), any())).thenReturn(List.of());

        service.searchCarriers("tenant-1", "  Mike  ");

        verify(userRepository).searchTruckers(any(), eq("Mike"), any());
    }

    // US-762 AC-1: lane search filters by origin/destination region and optional equipment type
    @Test
    void searchCarriersByLane_returnsMatchingCarriers() {
        String tenantId = "tenant-1";
        User trucker = makeTrucker("id-1", "Mike", "Johnson", "mike@example.com", EquipmentType.FLATBED);
        when(userRepository.searchTruckersByLane(eq(tenantId), eq("Midwest"), eq("Northeast"), eq(EquipmentType.FLATBED), any(PageRequest.class)))
                .thenReturn(List.of(trucker));

        List<CarrierLaneSearchResult> results = service.searchCarriersByLane(tenantId, "Midwest", "Northeast", "FLATBED");

        assertThat(results).hasSize(1);
        assertThat(results.get(0).id()).isEqualTo("id-1");
        assertThat(results.get(0).companyName()).isEqualTo("Mike Johnson");
        assertThat(results.get(0).email()).isEqualTo("mike@example.com");
        assertThat(results.get(0).equipmentTypes()).containsExactly("FLATBED");
    }

    // US-762 AC-2: equipmentType is optional — null filter passed through to repository
    @Test
    void searchCarriersByLane_allowsNullEquipmentType() {
        when(userRepository.searchTruckersByLane(any(), eq("Midwest"), eq("Northeast"), isNull(), any(PageRequest.class)))
                .thenReturn(List.of());

        service.searchCarriersByLane("tenant-1", "Midwest", "Northeast", null);

        verify(userRepository).searchTruckersByLane(any(), eq("Midwest"), eq("Northeast"), isNull(), any(PageRequest.class));
    }

    // US-848: blank origin with a destination present is a destination-only match — passes
    // origin=null through to the lane query rather than short-circuiting to empty (fixes the
    // Action Zone "Find Carriers" bug where an always-blank origin guaranteed zero results).
    @Test
    void searchCarriersByLane_originBlank_destinationOnlyMatch() {
        String tenantId = "tenant-1";
        User trucker = makeTrucker("id-1", "Mike", "Johnson", "mike@example.com", EquipmentType.FLATBED);
        when(userRepository.searchTruckersByLane(eq(tenantId), isNull(), eq("Northeast"), isNull(), any(PageRequest.class)))
                .thenReturn(List.of(trucker));

        List<CarrierLaneSearchResult> results = service.searchCarriersByLane(tenantId, "  ", "Northeast", null);

        assertThat(results).hasSize(1);
        verify(userRepository).searchTruckersByLane(eq(tenantId), isNull(), eq("Northeast"), isNull(), any(PageRequest.class));
        verify(userRepository, never()).findAllTruckers(any(), any(), any());
    }

    // US-848: destination blank with an origin present is an origin-only match — the Carrier
    // Network Page deep link from Shipment Status only ever supplies origin + equipment.
    @Test
    void searchCarriersByLane_destinationBlank_originOnlyMatch() {
        String tenantId = "tenant-1";
        User trucker = makeTrucker("id-1", "Mike", "Johnson", "mike@example.com", EquipmentType.DRY_VAN);
        when(userRepository.searchTruckersByLane(eq(tenantId), eq("IL"), isNull(), eq(EquipmentType.DRY_VAN), any(PageRequest.class)))
                .thenReturn(List.of(trucker));

        List<CarrierLaneSearchResult> results = service.searchCarriersByLane(tenantId, "IL", "", "DRY_VAN");

        assertThat(results).hasSize(1);
        verify(userRepository).searchTruckersByLane(eq(tenantId), eq("IL"), isNull(), eq(EquipmentType.DRY_VAN), any(PageRequest.class));
        verify(userRepository, never()).findAllTruckers(any(), any(), any());
    }

    // US-848: both origin and destination blank browses every carrier in the tenant (still
    // respecting an equipment filter if provided) instead of returning nothing.
    @Test
    void searchCarriersByLane_bothBlank_browsesAllTruckers() {
        String tenantId = "tenant-1";
        User trucker = makeTrucker("id-1", "Mike", "Johnson", "mike@example.com", EquipmentType.FLATBED);
        when(userRepository.findAllTruckers(eq(tenantId), isNull(), any(PageRequest.class)))
                .thenReturn(List.of(trucker));

        List<CarrierLaneSearchResult> results = service.searchCarriersByLane(tenantId, "", "  ", null);

        assertThat(results).hasSize(1);
        verify(userRepository).findAllTruckers(eq(tenantId), isNull(), any(PageRequest.class));
        verify(userRepository, never()).searchTruckersByLane(any(), any(), any(), any(), any());
    }

    // US-762 AC-4: carriers without an equipment type map to an empty list, not [null]
    @Test
    void searchCarriersByLane_mapsNullEquipmentTypeToEmptyList() {
        User trucker = makeTrucker("id-2", "Jane", "Smith", "jane@test.com", null);
        when(userRepository.searchTruckersByLane(any(), any(), any(), any(), any())).thenReturn(List.of(trucker));

        List<CarrierLaneSearchResult> results = service.searchCarriersByLane("tenant-1", "Midwest", "Northeast", null);

        assertThat(results.get(0).equipmentTypes()).isEmpty();
    }

    // US-856 AC-1: search results include each matched carrier's lanes, batch-loaded (not N+1)
    @Test
    void searchCarriersByLane_includesLanesForMatchedCarriers() {
        String tenantId = "tenant-1";
        User trucker = makeTrucker("id-1", "Mike", "Johnson", "mike@example.com", EquipmentType.FLATBED);
        when(userRepository.searchTruckersByLane(eq(tenantId), eq("Midwest"), eq("Northeast"), eq(EquipmentType.FLATBED), any(PageRequest.class)))
                .thenReturn(List.of(trucker));

        CarrierLaneEntity laneEntity = new CarrierLaneEntity(
                "lane-1", tenantId, "id-1", "Midwest", "Northeast",
                null, FrequencyPreference.WEEKLY, LaneStatus.ACTIVE, OffsetDateTime.now(), null);
        when(laneRepository.findByTenantIdAndTruckerIdInAndDeletedAtIsNull(tenantId, List.of("id-1")))
                .thenReturn(List.of(laneEntity));

        CarrierLaneDTO laneDto = new CarrierLaneDTO(
                "lane-1", "Midwest", "Northeast", null, FrequencyPreference.WEEKLY, LaneStatus.ACTIVE, laneEntity.getCreatedAt());
        when(mapper.toLaneDto(any(CarrierLane.class))).thenReturn(laneDto);

        List<CarrierLaneSearchResult> results = service.searchCarriersByLane(tenantId, "Midwest", "Northeast", "FLATBED");

        assertThat(results).hasSize(1);
        assertThat(results.get(0).lanes()).containsExactly(laneDto);
    }

    // US-856 AC-1: carriers with zero lanes on file map to an empty list, not null
    @Test
    void searchCarriersByLane_mapsNoLanesToEmptyList() {
        User trucker = makeTrucker("id-2", "Jane", "Smith", "jane@test.com", null);
        when(userRepository.searchTruckersByLane(any(), any(), any(), any(), any())).thenReturn(List.of(trucker));
        when(laneRepository.findByTenantIdAndTruckerIdInAndDeletedAtIsNull(any(), any())).thenReturn(List.of());

        List<CarrierLaneSearchResult> results = service.searchCarriersByLane("tenant-1", "Midwest", "Northeast", null);

        assertThat(results.get(0).lanes()).isEmpty();
    }

    // US-856: zero matched truckers short-circuits to no lane lookup at all
    @Test
    void searchCarriersByLane_noMatches_skipsLaneLookup() {
        when(userRepository.searchTruckersByLane(any(), any(), any(), any(), any())).thenReturn(List.of());

        service.searchCarriersByLane("tenant-1", "Midwest", "Northeast", null);

        verify(laneRepository, never()).findByTenantIdAndTruckerIdInAndDeletedAtIsNull(any(), any());
    }

    private User makeTrucker(String id, String firstName, String lastName, String email, EquipmentType equipmentType) {
        User user = new User();
        user.setRole(UserRole.TRUCKER);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        user.setEquipmentType(equipmentType);
        try {
            var f = User.class.getDeclaredField("id");
            f.setAccessible(true);
            f.set(user, id);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return user;
    }
}
