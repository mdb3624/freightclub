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

    // US-762 AC-1/AC-3: lane-based carrier search for the dashboard "Find a Carrier" panel
    // (origin/destination required there, Zod-validated client-side — both are always
    // supplied for that caller, so it always gets an exact-lane match, unaffected below).
    //
    // US-848: Carrier Network Page reuses this for three modes, chosen by which of
    // origin/destination are present:
    //   - both blank      -> browse all carriers in the tenant (equipment filter still applies)
    //   - one of the two  -> match carriers with a lane on that single dimension only (e.g. a
    //                        shipment's origin + equipment, when no exact destination lane exists)
    //   - both present    -> exact lane match (original US-762 behavior)
    public List<CarrierLaneSearchResult> searchCarriersByLane(String tenantId, String origin, String destination, String equipmentType) {
        EquipmentType equipmentTypeEnum = parseEquipmentType(equipmentType);
        if (equipmentType != null && !equipmentType.isBlank() && equipmentTypeEnum == null) {
            return List.of();
        }

        String originArg = isBlank(origin) ? null : origin.strip();
        String destinationArg = isBlank(destination) ? null : destination.strip();

        List<com.freightclub.domain.User> truckers = (originArg == null && destinationArg == null)
                ? userRepository.findAllTruckers(tenantId, equipmentTypeEnum, PageRequest.of(0, MAX_RESULTS))
                : userRepository.searchTruckersByLane(tenantId, originArg, destinationArg, equipmentTypeEnum, PageRequest.of(0, MAX_RESULTS));

        return truckers.stream()
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
