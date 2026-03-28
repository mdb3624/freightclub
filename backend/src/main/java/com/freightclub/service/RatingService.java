package com.freightclub.service;

import com.freightclub.domain.Load;
import com.freightclub.domain.LoadStatus;
import com.freightclub.domain.Rating;
import com.freightclub.domain.User;
import com.freightclub.domain.UserRole;
import com.freightclub.dto.CreateRatingRequest;
import com.freightclub.dto.RatingResponse;
import com.freightclub.dto.RatingSummaryResponse;
import com.freightclub.dto.ShipperPublicProfileResponse;
import com.freightclub.exception.LoadNotFoundException;
import com.freightclub.exception.RatingAlreadyExistsException;
import com.freightclub.exception.RatingNotAllowedException;
import com.freightclub.repository.LoadRepository;
import com.freightclub.repository.RatingRepository;
import com.freightclub.repository.UserRepository;
import com.freightclub.security.TenantContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Service
@Transactional
public class RatingService {

    private static final List<LoadStatus> RATABLE_STATUSES =
            List.of(LoadStatus.DELIVERED, LoadStatus.SETTLED);

    private final RatingRepository ratingRepository;
    private final LoadRepository loadRepository;
    private final UserRepository userRepository;

    public RatingService(RatingRepository ratingRepository,
                         LoadRepository loadRepository,
                         UserRepository userRepository) {
        this.ratingRepository = ratingRepository;
        this.loadRepository = loadRepository;
        this.userRepository = userRepository;
    }

    private record RatingContext(String reviewerId, String reviewedId, UserRole role, CreateRatingRequest req) {}

    /** Shipper rates the trucker who delivered their load. */
    public RatingResponse rateTrucker(String loadId, String shipperId, CreateRatingRequest req) {
        Load load = requireRatableLoad(loadId, TenantContextHolder.getTenantId());
        if (!shipperId.equals(load.getShipperId())) {
            throw new LoadNotFoundException(loadId);
        }
        if (load.getTruckerId() == null) {
            throw new RatingNotAllowedException("No trucker is assigned to this load");
        }
        if (ratingRepository.existsByLoadIdAndReviewerId(loadId, shipperId)) {
            throw new RatingAlreadyExistsException();
        }
        return save(load, new RatingContext(shipperId, load.getTruckerId(), UserRole.SHIPPER, req));
    }

    /** Trucker rates the shipper whose load they delivered. */
    public RatingResponse rateShipper(String loadId, String truckerId, CreateRatingRequest req) {
        Load load = requireRatableLoad(loadId, TenantContextHolder.getTenantId());
        if (!truckerId.equals(load.getTruckerId())) {
            throw new LoadNotFoundException(loadId);
        }
        if (ratingRepository.existsByLoadIdAndReviewerId(loadId, truckerId)) {
            throw new RatingAlreadyExistsException();
        }
        return save(load, new RatingContext(truckerId, load.getShipperId(), UserRole.TRUCKER, req));
    }

    @Transactional(readOnly = true)
    public Optional<RatingResponse> getMyRatingForLoad(String loadId, String reviewerId) {
        return ratingRepository.findByLoadIdAndReviewerId(loadId, reviewerId)
                .map(RatingResponse::from);
    }

    @Transactional(readOnly = true)
    public Page<RatingResponse> getMyRatingsReceived(String userId, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ratingRepository.findByReviewedIdOrderByCreatedAtDesc(userId, pageable)
                .map(RatingResponse::from);
    }

    @Transactional(readOnly = true)
    public RatingSummaryResponse getTruckerSummary(String truckerId) {
        long completed = loadRepository.countByTruckerIdAndStatusInAndDeletedAtIsNull(
                truckerId, RATABLE_STATUSES);
        return buildSummary(truckerId, UserRole.SHIPPER, completed);
    }

    @Transactional(readOnly = true)
    public RatingSummaryResponse getShipperSummary(String shipperId) {
        long completed = loadRepository.countByShipperIdAndStatusInAndDeletedAtIsNull(
                shipperId, RATABLE_STATUSES);
        return buildSummary(shipperId, UserRole.TRUCKER, completed);
    }

    @Transactional(readOnly = true)
    public ShipperPublicProfileResponse getShipperPublicProfile(String shipperId) {
        User shipper = userRepository.findById(shipperId)
                .orElseThrow(() -> new LoadNotFoundException(shipperId));
        long completed = loadRepository.countByShipperIdAndStatusInAndDeletedAtIsNull(
                shipperId, RATABLE_STATUSES);
        long cancelled = loadRepository.countByShipperIdAndStatusInAndDeletedAtIsNull(
                shipperId, List.of(LoadStatus.CANCELLED));
        RatingSummaryResponse summary = buildSummary(shipperId, UserRole.TRUCKER, completed);
        String displayName = shipper.getBusinessName() != null && !shipper.getBusinessName().isBlank()
                ? shipper.getBusinessName()
                : shipper.getFirstName() + " " + shipper.getLastName();
        return new ShipperPublicProfileResponse(
                shipperId, displayName, summary.avgStars(), summary.totalRatings(), completed, cancelled, null);
    }

    /** Batch fetch shipper avg-stars for the load board (keyed by shipperId). */
    @Transactional(readOnly = true)
    public Map<String, double[]> getShipperRatingSummaries(Set<String> shipperIds) {
        if (shipperIds.isEmpty()) return Map.of();
        List<Object[]> rows = ratingRepository.findSummariesForIds(shipperIds, UserRole.TRUCKER);
        Map<String, double[]> result = new HashMap<>();
        for (Object[] row : rows) {
            String id  = (String) row[0];
            Double avg = (Double) row[1];
            Long   cnt = (Long)   row[2];
            result.put(id, new double[]{ avg != null ? avg : 0.0, cnt != null ? cnt : 0L });
        }
        return result;
    }

    // ── helpers ──

    private RatingSummaryResponse buildSummary(String userId, UserRole raterRole, long completed) {
        Double avg = ratingRepository.findAvgStars(userId, raterRole);
        long count = ratingRepository.countRatings(userId, raterRole);
        return new RatingSummaryResponse(toBd(avg), count, completed);
    }

    private RatingResponse save(Load load, RatingContext ctx) {
        Rating r = new Rating();
        r.setTenantId(load.getTenantId());
        r.setLoadId(load.getId());
        r.setReviewerId(ctx.reviewerId());
        r.setReviewedId(ctx.reviewedId());
        r.setReviewerRole(ctx.role());
        r.setStars(ctx.req().stars());
        r.setComment(ctx.req().comment() != null && !ctx.req().comment().isBlank() ? ctx.req().comment().trim() : null);
        return RatingResponse.from(ratingRepository.save(r));
    }

    private Load requireRatableLoad(String loadId, String tenantId) {
        Load load = loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(loadId, tenantId)
                .orElseThrow(() -> new LoadNotFoundException(loadId));
        if (!RATABLE_STATUSES.contains(load.getStatus())) {
            throw new RatingNotAllowedException(
                    "Ratings can only be submitted after a load has been delivered");
        }
        return load;
    }

    private static BigDecimal toBd(Double avg) {
        return avg != null
                ? BigDecimal.valueOf(avg).setScale(1, RoundingMode.HALF_UP)
                : null;
    }
}
