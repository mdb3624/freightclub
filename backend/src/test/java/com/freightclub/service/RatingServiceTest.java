package com.freightclub.service;

import com.freightclub.domain.Load;
import com.freightclub.domain.LoadStatus;
import com.freightclub.domain.Rating;
import com.freightclub.domain.User;
import com.freightclub.domain.UserRole;
import com.freightclub.dto.CreateRatingRequest;
import com.freightclub.dto.RatingSummaryResponse;
import com.freightclub.exception.LoadNotFoundException;
import com.freightclub.exception.RatingAlreadyExistsException;
import com.freightclub.exception.RatingNotAllowedException;
import com.freightclub.repository.LoadRepository;
import com.freightclub.repository.RatingRepository;
import com.freightclub.repository.UserRepository;
import com.freightclub.security.TenantContextHolder;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RatingServiceTest {

    @Mock private RatingRepository ratingRepository;
    @Mock private LoadRepository loadRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks
    private RatingService ratingService;

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private Load makeDeliveredLoad(String id, String shipperId, String truckerId) {
        Load load = new Load();
        setField(load, "id", id);
        load.setStatus(LoadStatus.DELIVERED);
        setField(load, "tenantId", "tenant-1");
        setField(load, "shipperId", shipperId);
        load.setTruckerId(truckerId);
        return load;
    }

    private User makeUser(String id) {
        User user = new User();
        setField(user, "id", id);
        user.setFirstName("Test");
        user.setLastName("User");
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
    // rateTrucker
    // -------------------------------------------------------------------------

    @Nested
    class RateTrucker {

        @Test
        void happyPath_savesAndReturnsRating() {
            Load load = makeDeliveredLoad("load-1", "shipper-1", "trucker-1");
            when(ratingRepository.existsByLoadIdAndReviewerId("load-1", "shipper-1")).thenReturn(false);
            when(ratingRepository.save(any())).thenAnswer(inv -> {
                Rating r = inv.getArgument(0);
                setField(r, "id", "rating-1");
                return r;
            });

            try (MockedStatic<TenantContextHolder> ctx = mockStatic(TenantContextHolder.class)) {
                ctx.when(TenantContextHolder::getTenantId).thenReturn("tenant-1");
                when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull("load-1", "tenant-1"))
                        .thenReturn(Optional.of(load));

                var result = ratingService.rateTrucker("load-1", "shipper-1",
                        new CreateRatingRequest(5, "Great trucker"));

                assertThat(result).isNotNull();
                verify(ratingRepository).save(any(Rating.class));
            }
        }

        @Test
        void throws_whenShipperIsNotLoadOwner() {
            Load load = makeDeliveredLoad("load-1", "other-shipper", "trucker-1");
            try (MockedStatic<TenantContextHolder> ctx = mockStatic(TenantContextHolder.class)) {
                ctx.when(TenantContextHolder::getTenantId).thenReturn("tenant-1");
                when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull("load-1", "tenant-1"))
                        .thenReturn(Optional.of(load));

                assertThatThrownBy(() ->
                        ratingService.rateTrucker("load-1", "shipper-1",
                                new CreateRatingRequest(4, null)))
                        .isInstanceOf(LoadNotFoundException.class);
            }
        }

        @Test
        void throws_whenNoTruckerAssigned() {
            Load load = makeDeliveredLoad("load-1", "shipper-1", null);
            try (MockedStatic<TenantContextHolder> ctx = mockStatic(TenantContextHolder.class)) {
                ctx.when(TenantContextHolder::getTenantId).thenReturn("tenant-1");
                when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull("load-1", "tenant-1"))
                        .thenReturn(Optional.of(load));

                assertThatThrownBy(() ->
                        ratingService.rateTrucker("load-1", "shipper-1",
                                new CreateRatingRequest(3, null)))
                        .isInstanceOf(RatingNotAllowedException.class);
            }
        }

        @Test
        void throws_whenDuplicateRating() {
            Load load = makeDeliveredLoad("load-1", "shipper-1", "trucker-1");
            when(ratingRepository.existsByLoadIdAndReviewerId("load-1", "shipper-1")).thenReturn(true);
            try (MockedStatic<TenantContextHolder> ctx = mockStatic(TenantContextHolder.class)) {
                ctx.when(TenantContextHolder::getTenantId).thenReturn("tenant-1");
                when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull("load-1", "tenant-1"))
                        .thenReturn(Optional.of(load));

                assertThatThrownBy(() ->
                        ratingService.rateTrucker("load-1", "shipper-1",
                                new CreateRatingRequest(5, null)))
                        .isInstanceOf(RatingAlreadyExistsException.class);
            }
        }

        @Test
        void throws_whenLoadNotInRatableStatus() {
            Load load = makeDeliveredLoad("load-1", "shipper-1", "trucker-1");
            load.setStatus(LoadStatus.IN_TRANSIT);
            try (MockedStatic<TenantContextHolder> ctx = mockStatic(TenantContextHolder.class)) {
                ctx.when(TenantContextHolder::getTenantId).thenReturn("tenant-1");
                when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull("load-1", "tenant-1"))
                        .thenReturn(Optional.of(load));

                assertThatThrownBy(() ->
                        ratingService.rateTrucker("load-1", "shipper-1",
                                new CreateRatingRequest(5, null)))
                        .isInstanceOf(RatingNotAllowedException.class);
            }
        }
    }

    // -------------------------------------------------------------------------
    // rateShipper
    // -------------------------------------------------------------------------

    @Nested
    class RateShipper {

        @Test
        void happyPath_savesAndReturnsRating() {
            Load load = makeDeliveredLoad("load-1", "shipper-1", "trucker-1");
            when(ratingRepository.existsByLoadIdAndReviewerId("load-1", "trucker-1")).thenReturn(false);
            when(ratingRepository.save(any())).thenAnswer(inv -> {
                Rating r = inv.getArgument(0);
                setField(r, "id", "rating-2");
                return r;
            });

            try (MockedStatic<TenantContextHolder> ctx = mockStatic(TenantContextHolder.class)) {
                ctx.when(TenantContextHolder::getTenantId).thenReturn("tenant-1");
                when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull("load-1", "tenant-1"))
                        .thenReturn(Optional.of(load));

                var result = ratingService.rateShipper("load-1", "trucker-1",
                        new CreateRatingRequest(4, "Good shipper"));

                assertThat(result).isNotNull();
                verify(ratingRepository).save(any(Rating.class));
            }
        }

        @Test
        void throws_whenTruckerIsNotAssigned() {
            Load load = makeDeliveredLoad("load-1", "shipper-1", "other-trucker");
            try (MockedStatic<TenantContextHolder> ctx = mockStatic(TenantContextHolder.class)) {
                ctx.when(TenantContextHolder::getTenantId).thenReturn("tenant-1");
                when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull("load-1", "tenant-1"))
                        .thenReturn(Optional.of(load));

                assertThatThrownBy(() ->
                        ratingService.rateShipper("load-1", "trucker-1",
                                new CreateRatingRequest(4, null)))
                        .isInstanceOf(LoadNotFoundException.class);
            }
        }

        @Test
        void throws_whenDuplicateRating() {
            Load load = makeDeliveredLoad("load-1", "shipper-1", "trucker-1");
            when(ratingRepository.existsByLoadIdAndReviewerId("load-1", "trucker-1")).thenReturn(true);
            try (MockedStatic<TenantContextHolder> ctx = mockStatic(TenantContextHolder.class)) {
                ctx.when(TenantContextHolder::getTenantId).thenReturn("tenant-1");
                when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull("load-1", "tenant-1"))
                        .thenReturn(Optional.of(load));

                assertThatThrownBy(() ->
                        ratingService.rateShipper("load-1", "trucker-1",
                                new CreateRatingRequest(5, null)))
                        .isInstanceOf(RatingAlreadyExistsException.class);
            }
        }
    }

    // -------------------------------------------------------------------------
    // Summaries
    // -------------------------------------------------------------------------

    @Nested
    class GetSummaries {

        @Test
        void getTruckerSummary_returnsAvgAndCount() {
            when(ratingRepository.findAvgStars("trucker-1", UserRole.SHIPPER)).thenReturn(4.5);
            when(ratingRepository.countRatings("trucker-1", UserRole.SHIPPER)).thenReturn(10L);
            when(loadRepository.countByTruckerIdAndStatusInAndDeletedAtIsNull(
                    eq("trucker-1"), any())).thenReturn(8L);

            RatingSummaryResponse result = ratingService.getTruckerSummary("trucker-1");

            assertThat(result.avgStars()).isNotNull();
            assertThat(result.totalRatings()).isEqualTo(10L);
            assertThat(result.completedLoads()).isEqualTo(8L);
        }

        @Test
        void getTruckerSummary_nullAvg_returnsNullBigDecimal() {
            when(ratingRepository.findAvgStars(anyString(), any())).thenReturn(null);
            when(ratingRepository.countRatings(anyString(), any())).thenReturn(0L);
            when(loadRepository.countByTruckerIdAndStatusInAndDeletedAtIsNull(anyString(), any())).thenReturn(0L);

            RatingSummaryResponse result = ratingService.getTruckerSummary("trucker-new");

            assertThat(result.avgStars()).isNull();
        }

        @Test
        void getShipperRatingSummaries_emptySet_returnsEmptyMap() {
            var result = ratingService.getShipperRatingSummaries(Set.of());
            assertThat(result).isEmpty();
            verifyNoInteractions(ratingRepository);
        }

        @Test
        void getShipperRatingSummaries_returnsBatchResult() {
            Object[] row = new Object[]{"shipper-1", 4.2, 5L};
            List<Object[]> rows = new java.util.ArrayList<>();
            rows.add(row);
            when(ratingRepository.findSummariesForIds(any(), eq(UserRole.TRUCKER)))
                    .thenReturn(rows);

            var result = ratingService.getShipperRatingSummaries(Set.of("shipper-1"));

            assertThat(result).containsKey("shipper-1");
            assertThat(result.get("shipper-1")[0]).isEqualTo(4.2);
            assertThat(result.get("shipper-1")[1]).isEqualTo(5.0);
        }
    }

    // -------------------------------------------------------------------------
    // getShipperPublicProfile
    // -------------------------------------------------------------------------

    @Nested
    class GetShipperPublicProfile {

        @Test
        void happyPath_returnsProfile() {
            User shipper = makeUser("shipper-1");
            shipper.setBusinessName("Acme Freight");
            when(userRepository.findById("shipper-1")).thenReturn(Optional.of(shipper));
            when(ratingRepository.findAvgStars("shipper-1", UserRole.TRUCKER)).thenReturn(4.0);
            when(ratingRepository.countRatings("shipper-1", UserRole.TRUCKER)).thenReturn(3L);
            when(loadRepository.countByShipperIdAndStatusInAndDeletedAtIsNull(
                    eq("shipper-1"), any())).thenReturn(5L);

            var result = ratingService.getShipperPublicProfile("shipper-1");

            assertThat(result.shipperId()).isEqualTo("shipper-1");
            assertThat(result.displayName()).isEqualTo("Acme Freight");
        }

        @Test
        void throws_whenShipperNotFound() {
            when(userRepository.findById("unknown")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> ratingService.getShipperPublicProfile("unknown"))
                    .isInstanceOf(LoadNotFoundException.class);
        }
    }
}
