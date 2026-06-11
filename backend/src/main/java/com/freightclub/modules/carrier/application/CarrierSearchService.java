package com.freightclub.modules.carrier.application;

import com.freightclub.domain.EquipmentType;
import com.freightclub.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class CarrierSearchService {

    private static final int MAX_RESULTS = 8;

    private final UserRepository userRepository;

    public CarrierSearchService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // AC-v2-2, AC-v2-7: Search TRUCKER users within tenant by name or email
    public List<CarrierSearchResult> searchCarriers(String tenantId, String query) {
        if (query == null || query.strip().length() < 2) {
            return List.of();
        }
        return userRepository
                .searchTruckers(tenantId, query.strip(), PageRequest.of(0, MAX_RESULTS))
                .stream()
                .map(u -> new CarrierSearchResult(
                        u.getId(),
                        u.getFirstName(),
                        u.getLastName(),
                        u.getEmail(),
                        u.getEquipmentType() != null ? u.getEquipmentType().name() : null
                ))
                .toList();
    }

    // US-762 AC-1/AC-3: lane-based carrier search for the dashboard "Find a Carrier" panel.
    // origin/destination are required (Zod-validated client-side); equipmentType is optional.
    public List<CarrierLaneSearchResult> searchCarriersByLane(String tenantId, String origin, String destination, String equipmentType) {
        if (isBlank(origin) || isBlank(destination)) {
            return List.of();
        }
        EquipmentType equipmentTypeEnum = parseEquipmentType(equipmentType);
        if (equipmentType != null && !equipmentType.isBlank() && equipmentTypeEnum == null) {
            return List.of();
        }
        return userRepository
                .searchTruckersByLane(tenantId, origin.strip(), destination.strip(), equipmentTypeEnum, PageRequest.of(0, MAX_RESULTS))
                .stream()
                .map(u -> new CarrierLaneSearchResult(
                        u.getId(),
                        u.getFirstName() + " " + u.getLastName(),
                        u.getEmail(),
                        u.getEquipmentType() != null ? List.of(u.getEquipmentType().name()) : List.of(),
                        null
                ))
                .toList();
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private EquipmentType parseEquipmentType(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return EquipmentType.valueOf(value.strip().toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
