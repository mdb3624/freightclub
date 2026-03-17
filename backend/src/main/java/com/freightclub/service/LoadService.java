package com.freightclub.service;

import com.freightclub.domain.EquipmentType;
import com.freightclub.domain.Load;
import com.freightclub.domain.LoadStatus;
import com.freightclub.dto.CreateLoadRequest;
import com.freightclub.dto.LoadResponse;
import com.freightclub.dto.LoadSummaryResponse;
import com.freightclub.dto.UpdateLoadRequest;
import com.freightclub.exception.LoadEditForbiddenException;
import com.freightclub.exception.LoadNotClaimableException;
import com.freightclub.exception.LoadNotFoundException;
import com.freightclub.exception.LoadStatusTransitionException;
import com.freightclub.repository.LoadRepository;
import com.freightclub.repository.UserRepository;
import com.freightclub.security.TenantContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class LoadService {

    private final LoadRepository loadRepository;
    private final UserRepository userRepository;

    public LoadService(LoadRepository loadRepository, UserRepository userRepository) {
        this.loadRepository = loadRepository;
        this.userRepository = userRepository;
    }

    public LoadResponse createLoad(CreateLoadRequest request, String shipperId) {
        Load load = new Load();
        load.setTenantId(TenantContextHolder.getTenantId());
        load.setShipperId(shipperId);
        load.setStatus(LoadStatus.OPEN);
        applyFields(load, request.origin(), request.originAddress(), request.originZip(),
                request.destination(), request.destinationAddress(), request.destinationZip(),
                request.distanceMiles(),
                request.pickupFrom(), request.pickupTo(),
                request.deliveryFrom(), request.deliveryTo(),
                request.commodity(), request.weightLbs(),
                request.equipmentType(), request.payRate(), request.payRateType(),
                request.paymentTerms(), request.specialRequirements());
        return LoadResponse.from(loadRepository.save(load));
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
        return LoadResponse.from(load);
    }

    public LoadResponse updateLoad(String id, UpdateLoadRequest request, String shipperId) {
        Load load = findOwnedLoad(id, shipperId);
        requireEditable(load);
        applyFields(load, request.origin(), request.originAddress(), request.originZip(),
                request.destination(), request.destinationAddress(), request.destinationZip(),
                request.distanceMiles(),
                request.pickupFrom(), request.pickupTo(),
                request.deliveryFrom(), request.deliveryTo(),
                request.commodity(), request.weightLbs(),
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

    @Transactional(readOnly = true)
    public Page<LoadSummaryResponse> listOpenLoads(String truckerId, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        EquipmentType equipmentType = userRepository.findById(truckerId)
                .map(com.freightclub.domain.User::getEquipmentType)
                .orElse(null);
        if (equipmentType != null) {
            return loadRepository
                    .findByStatusAndEquipmentTypeAndDeletedAtIsNull(LoadStatus.OPEN, equipmentType, pageable)
                    .map(LoadSummaryResponse::from);
        }
        return loadRepository
                .findByStatusAndDeletedAtIsNull(LoadStatus.OPEN, pageable)
                .map(LoadSummaryResponse::from);
    }

    @Transactional(readOnly = true)
    public LoadResponse getOpenLoad(String id) {
        Load load = loadRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new LoadNotFoundException(id));
        return LoadResponse.from(load);
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
        return LoadResponse.from(loadRepository.save(load));
    }

    public LoadResponse markPickedUp(String id, String truckerId) {
        Load load = findAssignedLoad(id, truckerId);
        if (load.getStatus() != LoadStatus.CLAIMED) {
            throw new LoadStatusTransitionException("Load must be CLAIMED to mark as picked up");
        }
        load.setStatus(LoadStatus.IN_TRANSIT);
        return LoadResponse.from(loadRepository.save(load));
    }

    public LoadResponse markDelivered(String id, String truckerId) {
        Load load = findAssignedLoad(id, truckerId);
        if (load.getStatus() != LoadStatus.IN_TRANSIT) {
            throw new LoadStatusTransitionException("Load must be IN_TRANSIT to mark as delivered");
        }
        load.setStatus(LoadStatus.DELIVERED);
        return LoadResponse.from(loadRepository.save(load));
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
                .map(LoadResponse::from);
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

    private void applyFields(Load load, String origin, String originAddress, String originZip,
                              String destination, String destinationAddress, String destinationZip,
                              java.math.BigDecimal distanceMiles,
                              java.time.LocalDateTime pickupFrom, java.time.LocalDateTime pickupTo,
                              java.time.LocalDateTime deliveryFrom, java.time.LocalDateTime deliveryTo,
                              String commodity, java.math.BigDecimal weightLbs,
                              com.freightclub.domain.EquipmentType equipmentType,
                              java.math.BigDecimal payRate, com.freightclub.domain.PayRateType payRateType,
                              com.freightclub.domain.PaymentTerms paymentTerms,
                              String specialRequirements) {
        load.setOrigin(origin);
        load.setOriginAddress(originAddress);
        load.setOriginZip(originZip);
        load.setDestination(destination);
        load.setDestinationAddress(destinationAddress);
        load.setDestinationZip(destinationZip);
        load.setDistanceMiles(distanceMiles);
        load.setPickupFrom(pickupFrom);
        load.setPickupTo(pickupTo);
        load.setDeliveryFrom(deliveryFrom);
        load.setDeliveryTo(deliveryTo);
        load.setCommodity(commodity);
        load.setWeightLbs(weightLbs);
        load.setEquipmentType(equipmentType);
        load.setPayRate(payRate);
        load.setPayRateType(payRateType);
        load.setPaymentTerms(paymentTerms);
        load.setSpecialRequirements(specialRequirements);
    }
}
