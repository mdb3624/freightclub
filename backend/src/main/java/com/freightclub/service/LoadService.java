package com.freightclub.service;

import com.freightclub.domain.Load;
import com.freightclub.domain.LoadStatus;
import com.freightclub.dto.CreateLoadRequest;
import com.freightclub.dto.LoadResponse;
import com.freightclub.dto.LoadSummaryResponse;
import com.freightclub.dto.UpdateLoadRequest;
import com.freightclub.exception.LoadEditForbiddenException;
import com.freightclub.exception.LoadNotFoundException;
import com.freightclub.repository.LoadRepository;
import com.freightclub.security.TenantContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class LoadService {

    private final LoadRepository loadRepository;

    public LoadService(LoadRepository loadRepository) {
        this.loadRepository = loadRepository;
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
                request.specialRequirements());
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
                request.specialRequirements());
        return LoadResponse.from(loadRepository.save(load));
    }

    public LoadResponse cancelLoad(String id, String shipperId) {
        Load load = findOwnedLoad(id, shipperId);
        requireEditable(load);
        load.setStatus(LoadStatus.CANCELLED);
        return LoadResponse.from(loadRepository.save(load));
    }

    // --- helpers ---

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
        load.setSpecialRequirements(specialRequirements);
    }
}
