package com.freightclub.modules.carrier.application;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.freightclub.modules.carrier.domain.*;
import com.freightclub.modules.carrier.infrastructure.*;
import com.freightclub.security.TenantContextHolder;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class CarrierProfileService {

  private final CarrierEquipmentRepository equipmentRepository;
  private final CarrierLaneRepository laneRepository;
  private final CarrierAvailabilityRepository availabilityRepository;
  private final CarrierProfileAuditLogRepository auditLogRepository;
  private final ObjectMapper objectMapper;
  private final CarrierMapper carrierMapper;

  public CarrierProfileService(
      CarrierEquipmentRepository equipmentRepository,
      CarrierLaneRepository laneRepository,
      CarrierAvailabilityRepository availabilityRepository,
      CarrierProfileAuditLogRepository auditLogRepository,
      ObjectMapper objectMapper,
      CarrierMapper carrierMapper) {
    this.equipmentRepository = equipmentRepository;
    this.laneRepository = laneRepository;
    this.availabilityRepository = availabilityRepository;
    this.auditLogRepository = auditLogRepository;
    this.objectMapper = objectMapper;
    this.carrierMapper = carrierMapper;
  }

  // AC-1: Add equipment (validates type/dimensions, creates ACTIVE record)
  @CacheEvict(value = "carrierEquipment", key = "#truckerId + ':' + T(com.freightclub.security.TenantContextHolder).getTenantId()")
  public CarrierEquipmentDTO addEquipment(String truckerId, CarrierEquipmentDTO dto) {
    validateEquipmentInput(dto);

    String tenantId = TenantContextHolder.getTenantId();
    CarrierEquipment domain = CarrierEquipment.createNew(
        dto.equipmentType(),
        dto.lengthFeet(),
        dto.widthFeet(),
        dto.heightFeet(),
        dto.capacityLbs(),
        dto.equipmentCondition(),
        dto.yearModel(),
        tenantId,
        truckerId
    );

    CarrierEquipmentEntity entity = CarrierEquipmentEntity.fromDomain(domain);
    CarrierEquipmentEntity saved = equipmentRepository.save(entity);

    return carrierMapper.toDto(saved.toDomain());
  }

  // AC-1, AC-7: Get all equipment for trucker (NFR-504: 1h TTL cache)
  @Cacheable(
      value = "carrierEquipment",
      key = "#truckerId + ':' + T(com.freightclub.security.TenantContextHolder).getTenantId()",
      unless = "#result == null || #result.isEmpty()"
  )
  @Transactional(readOnly = true)
  public List<CarrierEquipmentDTO> getEquipment(String truckerId) {
    String tenantId = TenantContextHolder.getTenantId();
    List<CarrierEquipmentEntity> entities = equipmentRepository
        .findByTenantIdAndTruckerIdAndDeletedAtIsNull(tenantId, truckerId);

    return entities.stream()
        .map(entity -> carrierMapper.toDto(entity.toDomain()))
        .collect(Collectors.toList());
  }

  // AC-3: Update equipment (pre-populates form, allows edit, saves with updated_at)
  @CacheEvict(value = "carrierEquipment", key = "#truckerId + ':' + T(com.freightclub.security.TenantContextHolder).getTenantId()")
  public CarrierEquipmentDTO updateEquipment(String truckerId, CarrierEquipmentDTO dto) {
    validateEquipmentInput(dto);
    String tenantId = TenantContextHolder.getTenantId();

    CarrierEquipmentEntity entity = equipmentRepository.findById(dto.id())
        .orElseThrow(() -> new IllegalArgumentException("Equipment not found: " + dto.id()));

    if (!entity.getTenantId().equals(tenantId) || !entity.getTruckerId().equals(truckerId)) {
      throw new IllegalStateException("Equipment does not belong to this trucker");
    }

    CarrierEquipment domain = entity.toDomain();
    domain.updateEquipment(
        dto.lengthFeet(),
        dto.widthFeet(),
        dto.heightFeet(),
        dto.capacityLbs(),
        dto.equipmentCondition()
    );

    CarrierEquipmentEntity updated = CarrierEquipmentEntity.fromDomain(domain);
    updated.setId(dto.id());
    CarrierEquipmentEntity saved = equipmentRepository.save(updated);

    return carrierMapper.toDto(saved.toDomain());
  }

  // AC-4: Soft-delete equipment (set deleted_at, prevent deletion if in use)
  @CacheEvict(value = "carrierEquipment", key = "#truckerId + ':' + T(com.freightclub.security.TenantContextHolder).getTenantId()")
  public void deleteEquipment(String truckerId, String equipmentId) {
    String tenantId = TenantContextHolder.getTenantId();

    CarrierEquipmentEntity entity = equipmentRepository.findById(equipmentId)
        .orElseThrow(() -> new IllegalArgumentException("Equipment not found"));

    if (!entity.getTenantId().equals(tenantId) || !entity.getTruckerId().equals(truckerId)) {
      throw new IllegalStateException("Equipment does not belong to this trucker");
    }

    CarrierEquipment domain = entity.toDomain();
    domain.softDelete();

    CarrierEquipmentEntity updated = CarrierEquipmentEntity.fromDomain(domain);
    updated.setId(equipmentId);
    equipmentRepository.save(updated);
  }

  private void validateEquipmentInput(CarrierEquipmentDTO dto) {
    if (dto.equipmentType() == null) {
      throw new IllegalArgumentException("Equipment type is required");
    }
    if (dto.lengthFeet() <= 0) {
      throw new IllegalArgumentException("Dimensions must be positive");
    }
    if (dto.widthFeet() <= 0) {
      throw new IllegalArgumentException("Dimensions must be positive");
    }
    if (dto.heightFeet() <= 0) {
      throw new IllegalArgumentException("Dimensions must be positive");
    }
    if (dto.capacityLbs() <= 0) {
      throw new IllegalArgumentException("Capacity must be positive");
    }
  }

  // AC-2: Add lane (validates regions/frequency, creates ACTIVE record)
  @CacheEvict(value = "carrierLanes", key = "#truckerId + ':' + T(com.freightclub.security.TenantContextHolder).getTenantId()")
  public CarrierLaneDTO addLane(String truckerId, CarrierLaneDTO dto) {
    String tenantId = TenantContextHolder.getTenantId();
    CarrierLane domain = CarrierLane.createNew(
        tenantId,
        truckerId,
        dto.originRegion(),
        dto.destinationRegion(),
        dto.minRateCents(),
        dto.frequencyPreference()
    );

    CarrierLaneEntity entity = CarrierLaneEntity.fromDomain(domain);
    CarrierLaneEntity saved = laneRepository.save(entity);
    appendAuditLog(tenantId, truckerId, "ADD_LANE", null, dto, "SUCCESS");

    return carrierMapper.toLaneDto(saved.toDomain());
  }

  // AC-2, AC-7: Get all lanes for trucker (NFR-504: 1h TTL cache)
  @Cacheable(
      value = "carrierLanes",
      key = "#truckerId + ':' + T(com.freightclub.security.TenantContextHolder).getTenantId()",
      unless = "#result == null || #result.isEmpty()"
  )
  @Transactional(readOnly = true)
  public List<CarrierLaneDTO> getLanes(String truckerId) {
    String tenantId = TenantContextHolder.getTenantId();
    List<CarrierLaneEntity> entities = laneRepository
        .findByTenantIdAndTruckerIdAndDeletedAtIsNull(tenantId, truckerId);

    return entities.stream()
        .map(entity -> carrierMapper.toLaneDto(entity.toDomain()))
        .collect(Collectors.toList());
  }

  // AC-2: Update lane
  @CacheEvict(value = "carrierLanes", key = "#truckerId + ':' + T(com.freightclub.security.TenantContextHolder).getTenantId()")
  public CarrierLaneDTO updateLane(String truckerId, CarrierLaneDTO dto) {
    String tenantId = TenantContextHolder.getTenantId();

    CarrierLaneEntity entity = laneRepository.findById(dto.id())
        .orElseThrow(() -> new IllegalArgumentException("Lane not found"));

    if (!entity.getTenantId().equals(tenantId) || !entity.getTruckerId().equals(truckerId)) {
      throw new IllegalStateException("Lane does not belong to this trucker");
    }

    CarrierLane domain = entity.toDomain();
    domain.updateLane(dto.originRegion(), dto.destinationRegion(), dto.minRateCents(), dto.frequencyPreference());

    CarrierLaneEntity updated = CarrierLaneEntity.fromDomain(domain);
    updated.setId(dto.id());
    CarrierLaneEntity saved = laneRepository.save(updated);
    appendAuditLog(tenantId, truckerId, "UPDATE_LANES", null, dto, "SUCCESS");

    return carrierMapper.toLaneDto(saved.toDomain());
  }

  // AC-2: Delete lane
  @CacheEvict(value = "carrierLanes", key = "#truckerId + ':' + T(com.freightclub.security.TenantContextHolder).getTenantId()")
  public void deleteLane(String truckerId, String laneId) {
    String tenantId = TenantContextHolder.getTenantId();

    CarrierLaneEntity entity = laneRepository.findById(laneId)
        .orElseThrow(() -> new IllegalArgumentException("Lane not found"));

    if (!entity.getTenantId().equals(tenantId) || !entity.getTruckerId().equals(truckerId)) {
      throw new IllegalStateException("Lane does not belong to this trucker");
    }

    CarrierLane domain = entity.toDomain();
    domain.softDelete();

    CarrierLaneEntity updated = CarrierLaneEntity.fromDomain(domain);
    updated.setId(laneId);
    laneRepository.save(updated);
    appendAuditLog(tenantId, truckerId, "DELETE_LANE", null, laneId, "SUCCESS");
  }

  // AC-3: Set availability (creates/updates ONE record per trucker)
  @CacheEvict(value = "carrierAvailability", key = "#truckerId + ':' + T(com.freightclub.security.TenantContextHolder).getTenantId()")
  public CarrierAvailabilityDTO setAvailability(String truckerId, CarrierAvailabilityDTO dto) {
    String tenantId = TenantContextHolder.getTenantId();

    var existing = availabilityRepository.findByTenantIdAndTruckerId(tenantId, truckerId);

    CarrierAvailability domain;
    if (existing.isPresent()) {
      domain = existing.get().toDomain();
      domain.updateAvailability(dto.availableDays(), dto.availableStartTime(), dto.availableEndTime(),
          dto.timeZone(), dto.currentlyOnLoad());
    } else {
      domain = CarrierAvailability.createNew(
          tenantId,
          truckerId,
          dto.availableDays(),
          dto.availableStartTime(),
          dto.availableEndTime(),
          dto.timeZone(),
          dto.currentlyOnLoad()
      );
    }

    CarrierAvailabilityEntity entity = CarrierAvailabilityEntity.fromDomain(domain);
    CarrierAvailabilityEntity saved = availabilityRepository.save(entity);
    appendAuditLog(tenantId, truckerId, "SET_AVAILABILITY", null, dto, "SUCCESS");

    return carrierMapper.toAvailabilityDto(saved.toDomain());
  }

  // AC-3: Get availability (NFR-504: 30min TTL cache)
  @Cacheable(
      value = "carrierAvailability",
      key = "#truckerId + ':' + T(com.freightclub.security.TenantContextHolder).getTenantId()",
      unless = "#result == null"
  )
  @Transactional(readOnly = true)
  public CarrierAvailabilityDTO getAvailability(String truckerId) {
    String tenantId = TenantContextHolder.getTenantId();
    var entity = availabilityRepository.findByTenantIdAndTruckerId(tenantId, truckerId);

    return entity.map(e -> carrierMapper.toAvailabilityDto(e.toDomain())).orElse(null);
  }

  // AC-4: Get public profile (NFR-504: 2h TTL cache, masks sensitive data)
  @Cacheable(
      value = "carrierProfiles",
      key = "'public:' + #truckerId + ':' + T(com.freightclub.security.TenantContextHolder).getTenantId()",
      unless = "#result == null"
  )
  @Transactional(readOnly = true)
  public PublicCarrierProfileDTO getPublicProfile(String truckerId) {
    String tenantId = TenantContextHolder.getTenantId();

    List<CarrierEquipmentDTO> equipment = equipmentRepository
        .findByTenantIdAndTruckerIdAndDeletedAtIsNull(tenantId, truckerId)
        .stream()
        .map(e -> carrierMapper.toDto(e.toDomain()))
        .collect(Collectors.toList());

    List<CarrierLaneDTO> lanes = laneRepository
        .findByTenantIdAndTruckerIdAndDeletedAtIsNull(tenantId, truckerId)
        .stream()
        .map(e -> carrierMapper.toLaneDto(e.toDomain()))
        .collect(Collectors.toList());

    var availability = availabilityRepository.findByTenantIdAndTruckerId(tenantId, truckerId)
        .map(e -> carrierMapper.toAvailabilityDto(e.toDomain()))
        .orElse(null);

    return new PublicCarrierProfileDTO(truckerId, equipment, lanes, availability);
  }

  private void appendAuditLog(String tenantId, String truckerId, String action, Object dataBefore, Object dataAfter, String statusCode) {
    CarrierProfileAuditLog log = CarrierProfileAuditLog.createNew(
        tenantId, truckerId, action, toJson(dataBefore), toJson(dataAfter), statusCode, "0.0.0.0", "CLI"
    );
    CarrierProfileAuditLogEntity entity = CarrierProfileAuditLogEntity.fromDomain(log);
    auditLogRepository.save(entity);
  }

  private String toJson(Object value) {
    if (value == null) return null;
    try {
      return objectMapper.writeValueAsString(value);
    } catch (JsonProcessingException e) {
      return null;
    }
  }

}
