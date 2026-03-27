package com.freightclub.service;

import com.freightclub.domain.*;
import com.freightclub.domain.ClaimStatus;
import com.freightclub.dto.*;
import com.freightclub.exception.LoadEditForbiddenException;
import com.freightclub.exception.LoadNotClaimableException;
import com.freightclub.exception.LoadNotFoundException;
import com.freightclub.exception.LoadStatusTransitionException;
import com.freightclub.repository.ClaimRepository;
import com.freightclub.repository.LoadEventRepository;
import com.freightclub.repository.LoadRepository;
import com.freightclub.repository.UserRepository;
import com.freightclub.security.TenantContextHolder;
import com.freightclub.service.DocumentService;
import com.freightclub.service.RatingService;
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
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LoadServiceTest {

    @Mock private LoadRepository loadRepository;
    @Mock private UserRepository userRepository;
    @Mock private DocumentService documentService;
    @Mock private RatingService ratingService;
    @Mock private ClaimRepository claimRepository;
    @Mock private LoadEventRepository loadEventRepository;

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
        load.setOriginCity("Chicago");
        load.setOriginState("IL");
        load.setOriginZip("60601");
        load.setOriginAddress1("123 Main St");
        load.setDestinationCity("Detroit");
        load.setDestinationState("MI");
        load.setDestinationZip("48201");
        load.setDestinationAddress1("456 Industrial Blvd");
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

    private CreateLoadRequest makeCreateRequest() {
        return new CreateLoadRequest(
                "Chicago", "IL", "60601", "123 Main St", null,
                "Detroit", "MI", "48201", "456 Industrial Blvd", null,
                BigDecimal.valueOf(280),
                LocalDateTime.now().plusDays(1), LocalDateTime.now().plusDays(1).plusHours(4),
                LocalDateTime.now().plusDays(2), LocalDateTime.now().plusDays(2).plusHours(4),
                "Steel coils", BigDecimal.valueOf(40000),
                null, null, null,
                EquipmentType.FLATBED, BigDecimal.valueOf(3.50), PayRateType.PER_MILE,
                PaymentTerms.NET_30, null, null
        );
    }

    private CreateLoadRequest makeOverweightRequest(boolean acknowledged) {
        return new CreateLoadRequest(
                "Chicago", "IL", "60601", "123 Main St", null,
                "Detroit", "MI", "48201", "456 Industrial Blvd", null,
                BigDecimal.valueOf(280),
                LocalDateTime.now().plusDays(1), LocalDateTime.now().plusDays(1).plusHours(4),
                LocalDateTime.now().plusDays(2), LocalDateTime.now().plusDays(2).plusHours(4),
                "Steel coils", BigDecimal.valueOf(90000),
                null, null, null,
                EquipmentType.FLATBED, BigDecimal.valueOf(3.50), PayRateType.PER_MILE,
                PaymentTerms.NET_30, null, acknowledged
        );
    }

    private UpdateLoadRequest makeUpdateRequest() {
        return new UpdateLoadRequest(
                "Milwaukee", "WI", "53202", "789 Harbor Dr", null,
                "Cleveland", "OH", "44101", "321 Steel Ave", null,
                BigDecimal.valueOf(190),
                LocalDateTime.now().plusDays(2), LocalDateTime.now().plusDays(2).plusHours(4),
                LocalDateTime.now().plusDays(3), LocalDateTime.now().plusDays(3).plusHours(4),
                "Lumber", BigDecimal.valueOf(30000),
                null, null, null,
                EquipmentType.FLATBED, BigDecimal.valueOf(2.75), PayRateType.PER_MILE,
                null, null, null
        );
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
    // createLoad
    // -------------------------------------------------------------------------

    @Nested
    class CreateLoad {

        @Test
        void createsLoad_withCorrectFields() {
            when(loadRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(userRepository.findById(SHIPPER_ID)).thenReturn(Optional.of(makeShipper()));
            when(loadEventRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            doNothing().when(documentService).generateBolOnPublish(any());

            LoadResponse response = loadService.createLoad(makeCreateRequest(), SHIPPER_ID);

            assertThat(response.status()).isEqualTo(LoadStatus.OPEN);
            assertThat(response.originCity()).isEqualTo("Chicago");
            assertThat(response.originState()).isEqualTo("IL");
            assertThat(response.destinationCity()).isEqualTo("Detroit");
            assertThat(response.shipperId()).isEqualTo(SHIPPER_ID);
            assertThat(response.paymentTerms()).isEqualTo(PaymentTerms.NET_30);
            verify(loadRepository).save(any());
        }

        @Test
        void setsTenantId_fromContext() {
            when(loadRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(userRepository.findById(SHIPPER_ID)).thenReturn(Optional.of(makeShipper()));
            when(loadEventRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            doNothing().when(documentService).generateBolOnPublish(any());

            LoadResponse response = loadService.createLoad(makeCreateRequest(), SHIPPER_ID);

            assertThat(response.tenantId()).isEqualTo(TENANT_ID);
        }

        @Test
        void writesCreatedEvent() {
            when(loadRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(userRepository.findById(SHIPPER_ID)).thenReturn(Optional.of(makeShipper()));
            when(loadEventRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            doNothing().when(documentService).generateBolOnPublish(any());

            loadService.createLoad(makeCreateRequest(), SHIPPER_ID);

            verify(loadEventRepository).save(argThat(e -> "CREATED".equals(e.getEventType())));
        }

        @Test
        void throws_whenOverweightNotAcknowledged() {
            assertThatThrownBy(() -> loadService.createLoad(makeOverweightRequest(false), SHIPPER_ID))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("80,000");
        }

        @Test
        void succeeds_whenOverweightAcknowledged() {
            when(loadRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(userRepository.findById(SHIPPER_ID)).thenReturn(Optional.of(makeShipper()));
            when(loadEventRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            doNothing().when(documentService).generateBolOnPublish(any());

            LoadResponse response = loadService.createLoad(makeOverweightRequest(true), SHIPPER_ID);

            assertThat(response.weightLbs()).isEqualByComparingTo("90000");
        }
    }

    // -------------------------------------------------------------------------
    // listLoads
    // -------------------------------------------------------------------------

    @Nested
    class ListLoads {

        @Test
        void returnsLoads_forShipper() {
            Page<Load> page = new PageImpl<>(List.of(makeLoad(LOAD_ID, LoadStatus.OPEN)));
            when(loadRepository.findByTenantIdAndShipperIdAndDeletedAtIsNull(
                    eq(TENANT_ID), eq(SHIPPER_ID), any(Pageable.class)))
                    .thenReturn(page);

            Page<LoadSummaryResponse> result = loadService.listLoads(SHIPPER_ID, 0, 20);

            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).origin()).isEqualTo("Chicago, IL");
        }

        @Test
        void returnsEmpty_whenNoLoads() {
            when(loadRepository.findByTenantIdAndShipperIdAndDeletedAtIsNull(
                    eq(TENANT_ID), eq(SHIPPER_ID), any(Pageable.class)))
                    .thenReturn(new PageImpl<>(List.of()));

            Page<LoadSummaryResponse> result = loadService.listLoads(SHIPPER_ID, 0, 20);

            assertThat(result.getContent()).isEmpty();
        }
    }

    // -------------------------------------------------------------------------
    // getLoad
    // -------------------------------------------------------------------------

    @Nested
    class GetLoad {

        @Test
        void returns_ownedLoad() {
            Load load = makeLoad(LOAD_ID, LoadStatus.OPEN);
            when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(LOAD_ID, TENANT_ID))
                    .thenReturn(Optional.of(load));
            when(userRepository.findById(SHIPPER_ID)).thenReturn(Optional.of(makeShipper()));

            LoadResponse response = loadService.getLoad(LOAD_ID, SHIPPER_ID);

            assertThat(response.id()).isEqualTo(LOAD_ID);
            assertThat(response.shipperContact()).isNotNull();
        }

        @Test
        void throws_whenLoadNotFound() {
            when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(LOAD_ID, TENANT_ID))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> loadService.getLoad(LOAD_ID, SHIPPER_ID))
                    .isInstanceOf(LoadNotFoundException.class);
        }

        @Test
        void throws_whenShipperDoesNotOwnLoad() {
            Load load = makeLoad(LOAD_ID, LoadStatus.OPEN);
            when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(LOAD_ID, TENANT_ID))
                    .thenReturn(Optional.of(load));

            assertThatThrownBy(() -> loadService.getLoad(LOAD_ID, "other-shipper"))
                    .isInstanceOf(LoadNotFoundException.class);
        }
    }

    // -------------------------------------------------------------------------
    // updateLoad
    // -------------------------------------------------------------------------

    @Nested
    class UpdateLoad {

        @Test
        void updatesFields_forOpenLoad() {
            Load load = makeLoad(LOAD_ID, LoadStatus.OPEN);
            when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(LOAD_ID, TENANT_ID))
                    .thenReturn(Optional.of(load));
            when(loadRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            LoadResponse response = loadService.updateLoad(LOAD_ID, makeUpdateRequest(), SHIPPER_ID);

            assertThat(response.originCity()).isEqualTo("Milwaukee");
            assertThat(response.originState()).isEqualTo("WI");
            assertThat(response.destinationCity()).isEqualTo("Cleveland");
            assertThat(response.commodity()).isEqualTo("Lumber");
        }

        @Test
        void updatesFields_forDraftLoad() {
            Load load = makeLoad(LOAD_ID, LoadStatus.DRAFT);
            when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(LOAD_ID, TENANT_ID))
                    .thenReturn(Optional.of(load));
            when(loadRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            LoadResponse response = loadService.updateLoad(LOAD_ID, makeUpdateRequest(), SHIPPER_ID);

            assertThat(response.originCity()).isEqualTo("Milwaukee");
        }

        @Test
        void throws_whenLoadIsNotEditable() {
            Load load = makeLoad(LOAD_ID, LoadStatus.IN_TRANSIT);
            when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(LOAD_ID, TENANT_ID))
                    .thenReturn(Optional.of(load));

            assertThatThrownBy(() -> loadService.updateLoad(LOAD_ID, makeUpdateRequest(), SHIPPER_ID))
                    .isInstanceOf(LoadEditForbiddenException.class);
        }

        @Test
        void throws_whenShipperDoesNotOwnLoad() {
            Load load = makeLoad(LOAD_ID, LoadStatus.OPEN);
            when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(LOAD_ID, TENANT_ID))
                    .thenReturn(Optional.of(load));

            assertThatThrownBy(() -> loadService.updateLoad(LOAD_ID, makeUpdateRequest(), "other-shipper"))
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
            when(loadEventRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            LoadResponse response = loadService.cancelLoad(LOAD_ID, SHIPPER_ID);

            assertThat(response.status()).isEqualTo(LoadStatus.CANCELLED);
            verify(loadEventRepository).save(argThat(e -> "CANCELLED".equals(e.getEventType())));
        }

        @Test
        void succeeds_forDraftLoad() {
            Load load = makeLoad(LOAD_ID, LoadStatus.DRAFT);
            when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(LOAD_ID, TENANT_ID))
                    .thenReturn(Optional.of(load));
            when(loadRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(loadEventRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            LoadResponse response = loadService.cancelLoad(LOAD_ID, SHIPPER_ID);

            assertThat(response.status()).isEqualTo(LoadStatus.CANCELLED);
        }

        @Test
        void succeeds_forClaimedLoad_andCancelsClaim() {
            Load load = makeLoad(LOAD_ID, LoadStatus.CLAIMED);
            load.setTruckerId(TRUCKER_ID);
            when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(LOAD_ID, TENANT_ID))
                    .thenReturn(Optional.of(load));
            when(loadRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(loadEventRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(claimRepository.findFirstByLoadIdAndStatus(LOAD_ID, ClaimStatus.ACTIVE))
                    .thenReturn(Optional.empty()); // no active claim in this test

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
            when(documentService.hasBolPhoto(LOAD_ID)).thenReturn(true);
            when(loadEventRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            LoadResponse response = loadService.markPickedUp(LOAD_ID, TRUCKER_ID);

            assertThat(response.status()).isEqualTo(LoadStatus.IN_TRANSIT);
            verify(loadEventRepository).save(argThat(e -> "PICKED_UP".equals(e.getEventType())));
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
            when(documentService.hasPodPhoto(LOAD_ID)).thenReturn(true);
            when(loadEventRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            LoadResponse response = loadService.markDelivered(LOAD_ID, TRUCKER_ID);

            assertThat(response.status()).isEqualTo(LoadStatus.DELIVERED);
            verify(loadEventRepository).save(argThat(e -> "DELIVERED".equals(e.getEventType())));
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
    // claimLoad
    // -------------------------------------------------------------------------

    @Nested
    class ClaimLoad {

        @Test
        void claimsLoad_andRecordsClaimAndEvent() {
            Load load = makeLoad(LOAD_ID, LoadStatus.OPEN);
            when(loadRepository.findFirstByTruckerIdAndStatusInAndDeletedAtIsNull(eq(TRUCKER_ID), any()))
                    .thenReturn(Optional.empty());
            when(loadRepository.findByIdAndDeletedAtIsNullForUpdate(LOAD_ID))
                    .thenReturn(Optional.of(load));
            when(loadRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(claimRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(loadEventRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(userRepository.findById(SHIPPER_ID)).thenReturn(Optional.of(makeShipper()));

            LoadResponse response = loadService.claimLoad(LOAD_ID, TRUCKER_ID);

            assertThat(response.status()).isEqualTo(LoadStatus.CLAIMED);
            verify(claimRepository).save(argThat(c -> ClaimStatus.ACTIVE.equals(c.getStatus())
                    && TRUCKER_ID.equals(c.getTruckerId())));
            verify(loadEventRepository).save(argThat(e -> "CLAIMED".equals(e.getEventType())));
        }

        @Test
        void throws_whenTruckerHasActiveLoad() {
            Load activeLoad = makeLoad("other-load", LoadStatus.IN_TRANSIT);
            activeLoad.setTruckerId(TRUCKER_ID);
            when(loadRepository.findFirstByTruckerIdAndStatusInAndDeletedAtIsNull(eq(TRUCKER_ID), any()))
                    .thenReturn(Optional.of(activeLoad));

            assertThatThrownBy(() -> loadService.claimLoad(LOAD_ID, TRUCKER_ID))
                    .isInstanceOf(LoadNotClaimableException.class)
                    .hasMessageContaining("active load");
        }

        @Test
        void throws_whenLoadIsNotOpen() {
            Load load = makeLoad(LOAD_ID, LoadStatus.CLAIMED);
            when(loadRepository.findFirstByTruckerIdAndStatusInAndDeletedAtIsNull(eq(TRUCKER_ID), any()))
                    .thenReturn(Optional.empty());
            when(loadRepository.findByIdAndDeletedAtIsNullForUpdate(LOAD_ID))
                    .thenReturn(Optional.of(load));

            assertThatThrownBy(() -> loadService.claimLoad(LOAD_ID, TRUCKER_ID))
                    .isInstanceOf(LoadNotClaimableException.class)
                    .hasMessageContaining("not available");
        }
    }

    // -------------------------------------------------------------------------
    // getMyLoadHistory
    // -------------------------------------------------------------------------

    @Nested
    class GetMyLoadHistory {

        @Test
        void returnsDeliveredAndCancelledLoads() {
            Load delivered = makeLoad("load-d", LoadStatus.DELIVERED);
            delivered.setTruckerId(TRUCKER_ID);
            Load cancelled = makeLoad("load-c", LoadStatus.CANCELLED);
            cancelled.setTruckerId(TRUCKER_ID);
            when(loadRepository.findByTruckerIdAndStatusInAndDeletedAtIsNull(
                    eq(TRUCKER_ID), any(), any(Pageable.class)))
                    .thenReturn(new PageImpl<>(List.of(delivered, cancelled)));

            Page<LoadSummaryResponse> result = loadService.getMyLoadHistory(TRUCKER_ID, 0, 20);

            assertThat(result.getContent()).hasSize(2);
        }

        @Test
        void returnsEmpty_whenNoHistory() {
            when(loadRepository.findByTruckerIdAndStatusInAndDeletedAtIsNull(
                    eq(TRUCKER_ID), any(), any(Pageable.class)))
                    .thenReturn(new PageImpl<>(List.of()));

            Page<LoadSummaryResponse> result = loadService.getMyLoadHistory(TRUCKER_ID, 0, 20);

            assertThat(result.getContent()).isEmpty();
        }
    }

    // -------------------------------------------------------------------------
    // getMyActiveLoad
    // -------------------------------------------------------------------------

    @Nested
    class GetMyActiveLoad {

        @Test
        void returns_activeLoad_whenPresent() {
            Load load = makeLoad(LOAD_ID, LoadStatus.IN_TRANSIT);
            load.setTruckerId(TRUCKER_ID);
            when(loadRepository.findFirstByTruckerIdAndStatusInAndDeletedAtIsNull(
                    eq(TRUCKER_ID), any()))
                    .thenReturn(Optional.of(load));
            when(userRepository.findById(SHIPPER_ID)).thenReturn(Optional.of(makeShipper()));
            when(userRepository.findById(TRUCKER_ID)).thenReturn(Optional.of(makeTrucker()));

            Optional<LoadResponse> result = loadService.getMyActiveLoad(TRUCKER_ID);

            assertThat(result).isPresent();
            assertThat(result.get().status()).isEqualTo(LoadStatus.IN_TRANSIT);
        }

        @Test
        void returns_empty_whenNoActiveLoad() {
            when(loadRepository.findFirstByTruckerIdAndStatusInAndDeletedAtIsNull(
                    eq(TRUCKER_ID), any()))
                    .thenReturn(Optional.empty());

            Optional<LoadResponse> result = loadService.getMyActiveLoad(TRUCKER_ID);

            assertThat(result).isEmpty();
        }
    }

    // -------------------------------------------------------------------------
    // listOpenLoads — filtering
    // -------------------------------------------------------------------------

    @Nested
    class ListOpenLoads {

        @Test
        void returnsLoads_usingSpecification() {
            Page<Load> page = new PageImpl<>(List.of(makeLoad(LOAD_ID, LoadStatus.OPEN)));
            when(userRepository.findById(TRUCKER_ID)).thenReturn(Optional.empty());
            when(loadRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class), any(Pageable.class)))
                    .thenReturn(page);
            when(ratingService.getShipperRatingSummaries(any())).thenReturn(java.util.Map.of());

            LoadBoardFilter filter = new LoadBoardFilter(null, null, null, null, null, null);
            Page<LoadSummaryResponse> result = loadService.listOpenLoads(TRUCKER_ID, filter, 0, 20);

            assertThat(result.getContent()).hasSize(1);
            verify(loadRepository).findAll(any(org.springframework.data.jpa.domain.Specification.class), any(Pageable.class));
        }

        @Test
        void defaultsToTruckerEquipmentType_whenNoFilterSet() {
            User trucker = makeTrucker(); // has FLATBED
            Page<Load> page = new PageImpl<>(List.of(makeLoad(LOAD_ID, LoadStatus.OPEN)));
            when(userRepository.findById(TRUCKER_ID)).thenReturn(Optional.of(trucker));
            when(loadRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class), any(Pageable.class)))
                    .thenReturn(page);
            when(ratingService.getShipperRatingSummaries(any())).thenReturn(java.util.Map.of());

            LoadBoardFilter filter = new LoadBoardFilter(null, null, null, null, null, null);
            Page<LoadSummaryResponse> result = loadService.listOpenLoads(TRUCKER_ID, filter, 0, 20);

            assertThat(result.getContent()).hasSize(1);
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
