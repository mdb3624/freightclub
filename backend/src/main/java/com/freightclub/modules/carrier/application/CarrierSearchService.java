package com.freightclub.modules.carrier.application;

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
}
