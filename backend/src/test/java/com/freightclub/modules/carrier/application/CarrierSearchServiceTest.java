package com.freightclub.modules.carrier.application;

import com.freightclub.domain.EquipmentType;
import com.freightclub.domain.User;
import com.freightclub.domain.UserRole;
import com.freightclub.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageRequest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

// AC-v2-2, AC-v2-7: CarrierSearchService unit tests
class CarrierSearchServiceTest {

    private UserRepository userRepository;
    private CarrierSearchService service;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        service = new CarrierSearchService(userRepository);
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
