package com.freightclub.service;

import com.freightclub.domain.EquipmentType;
import com.freightclub.domain.Load;
import com.freightclub.domain.LoadStatus;
import com.freightclub.domain.User;
import com.freightclub.dto.CreateLoadRequest;
import com.freightclub.dto.LoadBoardFilter;
import com.freightclub.dto.LoadResponse;
import com.freightclub.dto.LoadSummaryResponse;
import com.freightclub.dto.UpdateLoadRequest;
import com.freightclub.repository.LoadSpecifications;
import com.freightclub.exception.LoadEditForbiddenException;
import com.freightclub.exception.LoadNotClaimableException;
import com.freightclub.exception.LoadNotFoundException;
import com.freightclub.exception.LoadStatusTransitionException;
import com.freightclub.exception.DocumentUploadRequiredException;
import com.freightclub.repository.LoadRepository;
import com.freightclub.repository.UserRepository;
import com.freightclub.security.TenantContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class LoadService {

    private final LoadRepository loadRepository;
    private final UserRepository userRepository;
    private final DocumentService documentService;
    private final RatingService ratingService;

    public LoadService(LoadRepository loadRepository, UserRepository userRepository,
                       DocumentService documentService, RatingService ratingService) {
        this.loadRepository = loadRepository;
        this.userRepository = userRepository;
        this.documentService = documentService;
        this.ratingService = ratingService;
    }

    public LoadResponse createDraft(CreateLoadRequest request, String shipperId) {
        Load load = new Load();
        load.setTenantId(TenantContextHolder.getTenantId());
        load.setShipperId(shipperId);
        load.setStatus(LoadStatus.DRAFT);
        applyFields(load, request.originCity(), request.originState(), request.originZip(),
                request.originAddress1(), request.originAddress2(),
                request.destinationCity(), request.destinationState(), request.destinationZip(),
                request.destinationAddress1(), request.destinationAddress2(),
                request.distanceMiles(),
                request.pickupFrom(), request.pickupTo(),
                request.deliveryFrom(), request.deliveryTo(),
                request.commodity(), request.weightLbs(),
                request.lengthFt(), request.widthFt(), request.heightFt(),
                request.equipmentType(), request.payRate(), request.payRateType(),
                request.paymentTerms(), request.specialRequirements());
        return buildResponse(loadRepository.save(load));
    }

    public LoadResponse createLoad(CreateLoadRequest request, String shipperId) {
        Load load = new Load();
        load.setTenantId(TenantContextHolder.getTenantId());
        load.setShipperId(shipperId);
        load.setStatus(LoadStatus.OPEN);
        applyFields(load, request.originCity(), request.originState(), request.originZip(),
                request.originAddress1(), request.originAddress2(),
                request.destinationCity(), request.destinationState(), request.destinationZip(),
                request.destinationAddress1(), request.destinationAddress2(),
                request.distanceMiles(),
                request.pickupFrom(), request.pickupTo(),
                request.deliveryFrom(), request.deliveryTo(),
                request.commodity(), request.weightLbs(),
                request.lengthFt(), request.widthFt(), request.heightFt(),
                request.equipmentType(), request.payRate(), request.payRateType(),
                request.paymentTerms(), request.specialRequirements());
        Load saved = loadRepository.save(load);
        documentService.generateBolOnPublish(saved);
        return buildResponse(saved);
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getLoadStatusCounts(String shipperId) {
        return loadRepository.countByStatusForShipper(shipperId).stream()
                .collect(Collectors.toMap(
                        row -> row[0].toString(),
                        row -> (Long) row[1]));
    }

    @Transactional(readOnly = true)
    public Page<LoadSummaryResponse> listLoads(String shipperId, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return loadRepository
                .findByTenantIdAndShipperIdAndDeletedAtIsNull(TenantContextHolder.getTenantId(), shipperId, pageable)
                .map(LoadSummaryResponse::from);
    }

    @Transactional(readOnly = true)
    public LoadResponse getLoad(String id, String shipperId) {
        Load load = findOwnedLoad(id, shipperId);
        return buildResponse(load);
    }

    public LoadResponse updateLoad(String id, UpdateLoadRequest request, String shipperId) {
        Load load = findOwnedLoad(id, shipperId);
        requireEditable(load);
        applyFields(load, request.originCity(), request.originState(), request.originZip(),
                request.originAddress1(), request.originAddress2(),
                request.destinationCity(), request.destinationState(), request.destinationZip(),
                request.destinationAddress1(), request.destinationAddress2(),
                request.distanceMiles(),
                request.pickupFrom(), request.pickupTo(),
                request.deliveryFrom(), request.deliveryTo(),
                request.commodity(), request.weightLbs(),
                request.lengthFt(), request.widthFt(), request.heightFt(),
                request.equipmentType(), request.payRate(), request.payRateType(),
                request.paymentTerms(), request.specialRequirements());
        return LoadResponse.from(loadRepository.save(load));
    }

    public LoadResponse cancelLoad(String id, String shipperId) {
        Load load = findOwnedLoad(id, shipperId);
        if (load.getStatus() == LoadStatus.DELIVERED
                || load.getStatus() == LoadStatus.SETTLED
                || load.getStatus() == LoadStatus.CANCELLED) {
            throw new LoadEditForbiddenException("Load cannot be cancelled in status: " + load.getStatus());
        }
        load.setStatus(LoadStatus.CANCELLED);
        return LoadResponse.from(loadRepository.save(load));
    }

    public LoadResponse publishLoad(String id, String shipperId) {
        Load load = findOwnedLoad(id, shipperId);
        if (load.getStatus() != LoadStatus.DRAFT) {
            throw new LoadEditForbiddenException("Only DRAFT loads can be published");
        }
        load.setStatus(LoadStatus.OPEN);
        Load saved = loadRepository.save(load);
        documentService.generateBolOnPublish(saved);
        return LoadResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public Page<LoadSummaryResponse> listOpenLoads(String truckerId, LoadBoardFilter filter, int page, int size) {
        Sort sort = resolveSort(filter.sortBy(), filter.sortDir());
        PageRequest pageable = PageRequest.of(page, size, sort);

        // If no explicit equipment filter, default to trucker's equipment type
        LoadBoardFilter effective = filter;
        if (filter.equipmentType() == null) {
            EquipmentType truckerEquipment = userRepository.findById(truckerId)
                    .map(com.freightclub.domain.User::getEquipmentType)
                    .orElse(null);
            if (truckerEquipment != null) {
                effective = new LoadBoardFilter(
                        filter.originState(), filter.destinationState(), truckerEquipment, filter.pickupDate(),
                        filter.sortBy(), filter.sortDir());
            }
        }

        org.springframework.data.domain.Page<com.freightclub.domain.Load> loadPage =
                loadRepository.findAll(LoadSpecifications.withFilter(effective), pageable);

        Set<String> shipperIds = loadPage.getContent().stream()
                .map(com.freightclub.domain.Load::getShipperId)
                .collect(Collectors.toSet());
        Map<String, double[]> ratings = ratingService.getShipperRatingSummaries(shipperIds);

        return loadPage.map(load -> {
            double[] r = ratings.get(load.getShipperId());
            return LoadSummaryResponse.from(load, r != null ? r[0] : null, r != null ? (long) r[1] : 0L);
        });
    }

    @Transactional(readOnly = true)
    public LoadResponse getOpenLoad(String id) {
        Load load = loadRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new LoadNotFoundException(id));
        return buildResponse(load);
    }

    public LoadResponse claimLoad(String id, String truckerId) {
        boolean hasActiveLoad = loadRepository.findFirstByTruckerIdAndStatusInAndDeletedAtIsNull(
                truckerId, List.of(LoadStatus.CLAIMED, LoadStatus.IN_TRANSIT)).isPresent();
        if (hasActiveLoad) {
            throw new LoadNotClaimableException("You already have an active load. Deliver it before claiming another.");
        }
        Load load = loadRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new LoadNotFoundException(id));
        if (load.getStatus() != LoadStatus.OPEN) {
            throw new LoadNotClaimableException("Load is not available to claim");
        }
        load.setStatus(LoadStatus.CLAIMED);
        load.setTruckerId(truckerId);
        return buildResponse(loadRepository.save(load));
    }

    public LoadResponse markPickedUp(String id, String truckerId) {
        Load load = findAssignedLoad(id, truckerId);
        if (load.getStatus() != LoadStatus.CLAIMED) {
            throw new LoadStatusTransitionException("Load must be CLAIMED to mark as picked up");
        }
        if (!documentService.hasBolPhoto(id)) {
            throw new DocumentUploadRequiredException(
                    "A BOL photo is required before marking the load as picked up. Upload a photo of the Bill of Lading first.");
        }
        load.setStatus(LoadStatus.IN_TRANSIT);
        return buildResponse(loadRepository.save(load));
    }

    public LoadResponse markDelivered(String id, String truckerId) {
        Load load = findAssignedLoad(id, truckerId);
        if (load.getStatus() != LoadStatus.IN_TRANSIT) {
            throw new LoadStatusTransitionException("Load must be IN_TRANSIT to mark as delivered");
        }
        if (!documentService.hasPodPhoto(id)) {
            throw new DocumentUploadRequiredException(
                    "A POD photo is required before marking the load as delivered. Upload a photo of the Proof of Delivery first.");
        }
        load.setStatus(LoadStatus.DELIVERED);
        return buildResponse(loadRepository.save(load));
    }

    @Transactional(readOnly = true)
    public Page<LoadSummaryResponse> getMyLoadHistory(String truckerId, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "updatedAt"));
        return loadRepository
                .findByTruckerIdAndStatusInAndDeletedAtIsNull(
                        truckerId,
                        List.of(LoadStatus.DELIVERED, LoadStatus.SETTLED, LoadStatus.CANCELLED),
                        pageable)
                .map(LoadSummaryResponse::from);
    }

    @Transactional(readOnly = true)
    public Optional<LoadResponse> getMyActiveLoad(String truckerId) {
        return loadRepository.findFirstByTruckerIdAndStatusInAndDeletedAtIsNull(
                        truckerId,
                        List.of(LoadStatus.CLAIMED, LoadStatus.IN_TRANSIT))
                .map(this::buildResponse);
    }

    // --- helpers ---

    private Load findAssignedLoad(String id, String truckerId) {
        Load load = loadRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new LoadNotFoundException(id));
        if (!truckerId.equals(load.getTruckerId())) {
            throw new LoadNotFoundException(id); // 404 to prevent enumeration
        }
        return load;
    }

    private Load findOwnedLoad(String id, String shipperId) {
        Load load = loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(id, TenantContextHolder.getTenantId())
                .orElseThrow(() -> new LoadNotFoundException(id));
        if (!load.getShipperId().equals(shipperId)) {
            throw new LoadNotFoundException(id); // 404 to prevent enumeration
        }
        return load;
    }

    private void requireEditable(Load load) {
        if (load.getStatus() != LoadStatus.DRAFT && load.getStatus() != LoadStatus.OPEN) {
            throw new LoadEditForbiddenException("Load cannot be edited in status: " + load.getStatus());
        }
    }

    private LoadResponse buildResponse(Load load) {
        User shipper = userRepository.findById(load.getShipperId()).orElse(null);
        User trucker = load.getTruckerId() != null
                ? userRepository.findById(load.getTruckerId()).orElse(null)
                : null;
        return LoadResponse.from(load, shipper, trucker);
    }

    private void applyFields(Load load, String originCity, String originState, String originZip,
                              String originAddress1, String originAddress2,
                              String destinationCity, String destinationState, String destinationZip,
                              String destinationAddress1, String destinationAddress2,
                              java.math.BigDecimal distanceMiles,
                              java.time.LocalDateTime pickupFrom, java.time.LocalDateTime pickupTo,
                              java.time.LocalDateTime deliveryFrom, java.time.LocalDateTime deliveryTo,
                              String commodity, java.math.BigDecimal weightLbs,
                              java.math.BigDecimal lengthFt, java.math.BigDecimal widthFt, java.math.BigDecimal heightFt,
                              com.freightclub.domain.EquipmentType equipmentType,
                              java.math.BigDecimal payRate, com.freightclub.domain.PayRateType payRateType,
                              com.freightclub.domain.PaymentTerms paymentTerms,
                              String specialRequirements) {
        load.setOriginCity(originCity);
        load.setOriginState(originState);
        load.setOriginZip(originZip);
        load.setOriginAddress1(originAddress1);
        load.setOriginAddress2(originAddress2);
        load.setDestinationCity(destinationCity);
        load.setDestinationState(destinationState);
        load.setDestinationZip(destinationZip);
        load.setDestinationAddress1(destinationAddress1);
        load.setDestinationAddress2(destinationAddress2);
        load.setDistanceMiles(distanceMiles);
        load.setPickupFrom(pickupFrom);
        load.setPickupTo(pickupTo);
        load.setDeliveryFrom(deliveryFrom);
        load.setDeliveryTo(deliveryTo);
        load.setCommodity(commodity);
        load.setWeightLbs(weightLbs);
        load.setLengthFt(lengthFt);
        load.setWidthFt(widthFt);
        load.setHeightFt(heightFt);
        load.setEquipmentType(equipmentType);
        load.setPayRate(payRate);
        load.setPayRateType(payRateType);
        load.setPaymentTerms(paymentTerms);
        load.setSpecialRequirements(specialRequirements);
    }

    private Sort resolveSort(String sortBy, String sortDir) {
        Sort.Direction dir = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        if ("distance".equals(sortBy)) {
            return Sort.by(dir, "distanceMiles").and(Sort.by(Sort.Direction.ASC, "pickupFrom"));
        }
        if ("pickupDate".equals(sortBy)) {
            return Sort.by(dir, "pickupFrom");
        }
        // Default: pickup date ascending (soonest first)
        return Sort.by(Sort.Direction.ASC, "pickupFrom");
    }
}
