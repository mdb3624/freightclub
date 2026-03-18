package com.freightclub.service;

import com.freightclub.domain.*;
import com.freightclub.dto.LoadResponse;
import com.freightclub.dto.LoadSummaryResponse;
import com.freightclub.exception.LoadEditForbiddenException;
import com.freightclub.exception.LoadNotClaimableException;
import com.freightclub.exception.LoadNotFoundException;
import com.freightclub.exception.LoadStatusTransitionException;
import com.freightclub.repository.LoadRepository;
import com.freightclub.repository.UserRepository;
import com.freightclub.security.TenantContextHolder;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LoadServiceTest {

    @Mock
    private LoadRepository loadRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private LoadService loadService;

    private static final String TENANT_ID  = "tenant-1";
    private static final String SHIPPER_ID = "shipper-1";
    private static final String TRUCKER_ID = "trucker-1";
    private static final String LOAD_ID    = "load-1";

    @BeforeEach
    void setTenant() {
        TenantContextHolder.setTenantId(TENANT_ID);
    }

    @AfterEach
    void clearTenant() {
        TenantContextHolder.clear();
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private Load makeLoad(String id, LoadStatus status) {
        Load load = new Load();
        setField(load, "id", id);
        load.setTenantId(TENANT_ID);
        load.setShipperId(SHIPPER_ID);
        load.setStatus(status);
        load.setOrigin("Chicago, IL");
        load.setOriginAddress("123 Main St");
        load.setOriginZip("60601");
        load.setDestination("Detroit, MI");
        load.setDestinationAddress("456 Industrial Blvd");
        load.setDestinationZip("48201");
        load.setPickupFrom(LocalDateTime.now().plusDays(1));
        load.setPickupTo(LocalDateTime.now().plusDays(1).plusHours(4));
        load.setDeliveryFrom(LocalDateTime.now().plusDays(2));
        load.setDeliveryTo(LocalDateTime.now().plusDays(2).plusHours(4));
        load.setCommodity("Steel coils");
        load.setWeightLbs(BigDecimal.valueOf(40000));
        load.setEquipmentType(EquipmentType.FLATBED);
        load.setPayRate(BigDecimal.valueOf(3.50));
        load.setPayRateType(PayRateType.PER_MILE);
        return load;
    }

    private User makeShipper() {
        User user = new User();
        setField(user, "id", SHIPPER_ID);
        user.setEmail("shipper@example.com");
        user.setFirstName("Alice");
        user.setLastName("Smith");
        user.setRole(UserRole.SHIPPER);
        user.setTenantId(TENANT_ID);
        return user;
    }

    private User makeTrucker() {
        User user = new User();
        setField(user, "id", TRUCKER_ID);
        user.setEmail("trucker@example.com");
        user.setFirstName("Bob");
        user.setLastName("Jones");
        user.setRole(UserRole.TRUCKER);
        user.setTenantId(TENANT_ID);
        user.setMcNumber("MC-123456");
        user.setDotNumber("DOT-789");
        user.setEquipmentType(EquipmentType.FLATBED);
        return user;
    }

    private static void setField(Object target, String name, Object value) {
        try {
            Field f = target.getClass().getDeclaredField(name);
            f.setAccessible(true);
            f.set(target, value);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    // -------------------------------------------------------------------------
    // claimLoad
    // -------------------------------------------------------------------------

    @Nested
    class ClaimLoad {

        @Test
        void succeeds_whenLoadIsOpenAndTruckerHasNoActiveLoad() {
            Load load = makeLoad(LOAD_ID, LoadStatus.OPEN);
            when(loadRepository.findFirstByTruckerIdAndStatusInAndDeletedAtIsNull(
                    eq(TRUCKER_ID), any())).thenReturn(Optional.empty());
            when(loadRepository.findByIdAndDeletedAtIsNull(LOAD_ID)).thenReturn(Optional.of(load));
            when(loadRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(userRepository.findById(SHIPPER_ID)).thenReturn(Optional.of(makeShipper()));
            when(userRepository.findById(TRUCKER_ID)).thenReturn(Optional.of(makeTrucker()));

            LoadResponse response = loadService.claimLoad(LOAD_ID, TRUCKER_ID);

            assertThat(response.status()).isEqualTo(LoadStatus.CLAIMED);
            assertThat(response.truckerId()).isEqualTo(TRUCKER_ID);
        }

        @Test
        void throws_whenTruckerAlreadyHasActiveLoad() {
            Load activeLoad = makeLoad("other-load", LoadStatus.IN_TRANSIT);
            activeLoad.setTruckerId(TRUCKER_ID);
            when(loadRepository.findFirstByTruckerIdAndStatusInAndDeletedAtIsNull(
                    eq(TRUCKER_ID), any())).thenReturn(Optional.of(activeLoad));

            assertThatThrownBy(() -> loadService.claimLoad(LOAD_ID, TRUCKER_ID))
                    .isInstanceOf(LoadNotClaimableException.class)
                    .hasMessageContaining("active load");
        }

        @Test
        void throws_whenLoadIsNotOpen() {
            Load load = makeLoad(LOAD_ID, LoadStatus.CLAIMED);
            when(loadRepository.findFirstByTruckerIdAndStatusInAndDeletedAtIsNull(
                    eq(TRUCKER_ID), any())).thenReturn(Optional.empty());
            when(loadRepository.findByIdAndDeletedAtIsNull(LOAD_ID)).thenReturn(Optional.of(load));

            assertThatThrownBy(() -> loadService.claimLoad(LOAD_ID, TRUCKER_ID))
                    .isInstanceOf(LoadNotClaimableException.class)
                    .hasMessageContaining("not available");
        }

        @Test
        void throws_whenLoadDoesNotExist() {
            when(loadRepository.findFirstByTruckerIdAndStatusInAndDeletedAtIsNull(
                    eq(TRUCKER_ID), any())).thenReturn(Optional.empty());
            when(loadRepository.findByIdAndDeletedAtIsNull(LOAD_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> loadService.claimLoad(LOAD_ID, TRUCKER_ID))
                    .isInstanceOf(LoadNotFoundException.class);
        }
    }

    // -------------------------------------------------------------------------
    // cancelLoad
    // -------------------------------------------------------------------------

    @Nested
    class CancelLoad {

        @Test
        void succeeds_forOpenLoad() {
            Load load = makeLoad(LOAD_ID, LoadStatus.OPEN);
            when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(LOAD_ID, TENANT_ID))
                    .thenReturn(Optional.of(load));
            when(loadRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(userRepository.findById(SHIPPER_ID)).thenReturn(Optional.of(makeShipper()));

            LoadResponse response = loadService.cancelLoad(LOAD_ID, SHIPPER_ID);

            assertThat(response.status()).isEqualTo(LoadStatus.CANCELLED);
        }

        @Test
        void succeeds_forClaimedLoad() {
            Load load = makeLoad(LOAD_ID, LoadStatus.CLAIMED);
            load.setTruckerId(TRUCKER_ID);
            when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(LOAD_ID, TENANT_ID))
                    .thenReturn(Optional.of(load));
            when(loadRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(userRepository.findById(SHIPPER_ID)).thenReturn(Optional.of(makeShipper()));
            when(userRepository.findById(TRUCKER_ID)).thenReturn(Optional.of(makeTrucker()));

            LoadResponse response = loadService.cancelLoad(LOAD_ID, SHIPPER_ID);

            assertThat(response.status()).isEqualTo(LoadStatus.CANCELLED);
        }

        @Test
        void throws_forDeliveredLoad() {
            Load load = makeLoad(LOAD_ID, LoadStatus.DELIVERED);
            when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(LOAD_ID, TENANT_ID))
                    .thenReturn(Optional.of(load));

            assertThatThrownBy(() -> loadService.cancelLoad(LOAD_ID, SHIPPER_ID))
                    .isInstanceOf(LoadEditForbiddenException.class);
        }

        @Test
        void throws_forSettledLoad() {
            Load load = makeLoad(LOAD_ID, LoadStatus.SETTLED);
            when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(LOAD_ID, TENANT_ID))
                    .thenReturn(Optional.of(load));

            assertThatThrownBy(() -> loadService.cancelLoad(LOAD_ID, SHIPPER_ID))
                    .isInstanceOf(LoadEditForbiddenException.class);
        }

        @Test
        void throws_forAlreadyCancelledLoad() {
            Load load = makeLoad(LOAD_ID, LoadStatus.CANCELLED);
            when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(LOAD_ID, TENANT_ID))
                    .thenReturn(Optional.of(load));

            assertThatThrownBy(() -> loadService.cancelLoad(LOAD_ID, SHIPPER_ID))
                    .isInstanceOf(LoadEditForbiddenException.class);
        }

        @Test
        void throws_whenShipperDoesNotOwnLoad() {
            Load load = makeLoad(LOAD_ID, LoadStatus.OPEN);
            when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(LOAD_ID, TENANT_ID))
                    .thenReturn(Optional.of(load));

            assertThatThrownBy(() -> loadService.cancelLoad(LOAD_ID, "other-shipper"))
                    .isInstanceOf(LoadNotFoundException.class);
        }
    }

    // -------------------------------------------------------------------------
    // markPickedUp
    // -------------------------------------------------------------------------

    @Nested
    class MarkPickedUp {

        @Test
        void transitions_claimedToInTransit() {
            Load load = makeLoad(LOAD_ID, LoadStatus.CLAIMED);
            load.setTruckerId(TRUCKER_ID);
            when(loadRepository.findByIdAndDeletedAtIsNull(LOAD_ID)).thenReturn(Optional.of(load));
            when(loadRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(userRepository.findById(SHIPPER_ID)).thenReturn(Optional.of(makeShipper()));
            when(userRepository.findById(TRUCKER_ID)).thenReturn(Optional.of(makeTrucker()));

            LoadResponse response = loadService.markPickedUp(LOAD_ID, TRUCKER_ID);

            assertThat(response.status()).isEqualTo(LoadStatus.IN_TRANSIT);
        }

        @Test
        void throws_whenLoadIsNotClaimed() {
            Load load = makeLoad(LOAD_ID, LoadStatus.OPEN);
            load.setTruckerId(TRUCKER_ID);
            when(loadRepository.findByIdAndDeletedAtIsNull(LOAD_ID)).thenReturn(Optional.of(load));

            assertThatThrownBy(() -> loadService.markPickedUp(LOAD_ID, TRUCKER_ID))
                    .isInstanceOf(LoadStatusTransitionException.class)
                    .hasMessageContaining("CLAIMED");
        }

        @Test
        void throws_whenTruckerIsNotAssigned() {
            Load load = makeLoad(LOAD_ID, LoadStatus.CLAIMED);
            load.setTruckerId("other-trucker");
            when(loadRepository.findByIdAndDeletedAtIsNull(LOAD_ID)).thenReturn(Optional.of(load));

            assertThatThrownBy(() -> loadService.markPickedUp(LOAD_ID, TRUCKER_ID))
                    .isInstanceOf(LoadNotFoundException.class);
        }
    }

    // -------------------------------------------------------------------------
    // markDelivered
    // -------------------------------------------------------------------------

    @Nested
    class MarkDelivered {

        @Test
        void transitions_inTransitToDelivered() {
            Load load = makeLoad(LOAD_ID, LoadStatus.IN_TRANSIT);
            load.setTruckerId(TRUCKER_ID);
            when(loadRepository.findByIdAndDeletedAtIsNull(LOAD_ID)).thenReturn(Optional.of(load));
            when(loadRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(userRepository.findById(SHIPPER_ID)).thenReturn(Optional.of(makeShipper()));
            when(userRepository.findById(TRUCKER_ID)).thenReturn(Optional.of(makeTrucker()));

            LoadResponse response = loadService.markDelivered(LOAD_ID, TRUCKER_ID);

            assertThat(response.status()).isEqualTo(LoadStatus.DELIVERED);
        }

        @Test
        void throws_whenLoadIsNotInTransit() {
            Load load = makeLoad(LOAD_ID, LoadStatus.CLAIMED);
            load.setTruckerId(TRUCKER_ID);
            when(loadRepository.findByIdAndDeletedAtIsNull(LOAD_ID)).thenReturn(Optional.of(load));

            assertThatThrownBy(() -> loadService.markDelivered(LOAD_ID, TRUCKER_ID))
                    .isInstanceOf(LoadStatusTransitionException.class)
                    .hasMessageContaining("IN_TRANSIT");
        }

        @Test
        void throws_whenTruckerIsNotAssigned() {
            Load load = makeLoad(LOAD_ID, LoadStatus.IN_TRANSIT);
            load.setTruckerId("other-trucker");
            when(loadRepository.findByIdAndDeletedAtIsNull(LOAD_ID)).thenReturn(Optional.of(load));

            assertThatThrownBy(() -> loadService.markDelivered(LOAD_ID, TRUCKER_ID))
                    .isInstanceOf(LoadNotFoundException.class);
        }
    }

    // -------------------------------------------------------------------------
    // listOpenLoads — equipment type filtering
    // -------------------------------------------------------------------------

    @Nested
    class ListOpenLoads {

        @Test
        void filtersBy_truckerEquipmentType_whenSet() {
            User trucker = makeTrucker(); // has FLATBED
            Page<Load> page = new PageImpl<>(List.of(makeLoad(LOAD_ID, LoadStatus.OPEN)));
            when(userRepository.findById(TRUCKER_ID)).thenReturn(Optional.of(trucker));
            when(loadRepository.findByStatusAndEquipmentTypeAndDeletedAtIsNull(
                    eq(LoadStatus.OPEN), eq(EquipmentType.FLATBED), any(Pageable.class)))
                    .thenReturn(page);

            Page<LoadSummaryResponse> result = loadService.listOpenLoads(TRUCKER_ID, 0, 20);

            assertThat(result.getContent()).hasSize(1);
            verify(loadRepository).findByStatusAndEquipmentTypeAndDeletedAtIsNull(
                    eq(LoadStatus.OPEN), eq(EquipmentType.FLATBED), any(Pageable.class));
            verify(loadRepository, never()).findByStatusAndDeletedAtIsNull(any(), any());
        }

        @Test
        void returnsAllLoads_whenTruckerHasNoEquipmentType() {
            User trucker = makeTrucker();
            trucker.setEquipmentType(null);
            Page<Load> page = new PageImpl<>(List.of(makeLoad(LOAD_ID, LoadStatus.OPEN)));
            when(userRepository.findById(TRUCKER_ID)).thenReturn(Optional.of(trucker));
            when(loadRepository.findByStatusAndDeletedAtIsNull(
                    eq(LoadStatus.OPEN), any(Pageable.class)))
                    .thenReturn(page);

            Page<LoadSummaryResponse> result = loadService.listOpenLoads(TRUCKER_ID, 0, 20);

            assertThat(result.getContent()).hasSize(1);
            verify(loadRepository).findByStatusAndDeletedAtIsNull(eq(LoadStatus.OPEN), any());
            verify(loadRepository, never()).findByStatusAndEquipmentTypeAndDeletedAtIsNull(
                    any(), any(), any());
        }

        @Test
        void returnsAllLoads_whenTruckerNotFound() {
            Page<Load> page = new PageImpl<>(List.of());
            when(userRepository.findById(TRUCKER_ID)).thenReturn(Optional.empty());
            when(loadRepository.findByStatusAndDeletedAtIsNull(
                    eq(LoadStatus.OPEN), any(Pageable.class)))
                    .thenReturn(page);

            loadService.listOpenLoads(TRUCKER_ID, 0, 20);

            verify(loadRepository).findByStatusAndDeletedAtIsNull(eq(LoadStatus.OPEN), any());
        }
    }

    // -------------------------------------------------------------------------
    // Contact info in responses
    // -------------------------------------------------------------------------

    @Nested
    class ContactInfo {

        @Test
        void includesShipperContact_always() {
            Load load = makeLoad(LOAD_ID, LoadStatus.OPEN);
            when(loadRepository.findByIdAndDeletedAtIsNull(LOAD_ID)).thenReturn(Optional.of(load));
            when(userRepository.findById(SHIPPER_ID)).thenReturn(Optional.of(makeShipper()));

            LoadResponse response = loadService.getOpenLoad(LOAD_ID);

            assertThat(response.shipperContact()).isNotNull();
            assertThat(response.shipperContact().name()).isEqualTo("Alice Smith");
            assertThat(response.shipperContact().email()).isEqualTo("shipper@example.com");
        }

        @Test
        void includesTruckerContact_whenTruckerAssigned() {
            Load load = makeLoad(LOAD_ID, LoadStatus.CLAIMED);
            load.setTruckerId(TRUCKER_ID);
            when(loadRepository.findByIdAndDeletedAtIsNull(LOAD_ID)).thenReturn(Optional.of(load));
            when(userRepository.findById(SHIPPER_ID)).thenReturn(Optional.of(makeShipper()));
            when(userRepository.findById(TRUCKER_ID)).thenReturn(Optional.of(makeTrucker()));

            LoadResponse response = loadService.getOpenLoad(LOAD_ID);

            assertThat(response.truckerContact()).isNotNull();
            assertThat(response.truckerContact().name()).isEqualTo("Bob Jones");
            assertThat(response.truckerContact().mcNumber()).isEqualTo("MC-123456");
            assertThat(response.truckerContact().dotNumber()).isEqualTo("DOT-789");
        }

        @Test
        void noTruckerContact_whenLoadNotYetClaimed() {
            Load load = makeLoad(LOAD_ID, LoadStatus.OPEN);
            when(loadRepository.findByIdAndDeletedAtIsNull(LOAD_ID)).thenReturn(Optional.of(load));
            when(userRepository.findById(SHIPPER_ID)).thenReturn(Optional.of(makeShipper()));

            LoadResponse response = loadService.getOpenLoad(LOAD_ID);

            assertThat(response.truckerContact()).isNull();
        }
    }
}
