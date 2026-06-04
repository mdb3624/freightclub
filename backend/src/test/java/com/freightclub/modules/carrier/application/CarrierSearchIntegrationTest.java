package com.freightclub.modules.carrier.application;

import com.freightclub.domain.EquipmentType;
import com.freightclub.domain.Tenant;
import com.freightclub.domain.User;
import com.freightclub.domain.UserRole;
import com.freightclub.repository.TenantRepository;
import com.freightclub.repository.UserRepository;
import com.freightclub.security.TenantContextHolder;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

// AC-v2-2: Integration — search returns real DB results within tenant
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class CarrierSearchIntegrationTest {

    @Autowired private CarrierSearchService carrierSearchService;
    @Autowired private UserRepository userRepository;
    @Autowired private TenantRepository tenantRepository;

    private String tenantId;
    private String otherTenantId;

    @BeforeEach
    void setUp() {
        tenantId = UUID.randomUUID().toString();
        otherTenantId = UUID.randomUUID().toString();
        tenantRepository.save(makeTenant(tenantId));
        tenantRepository.save(makeTenant(otherTenantId));
        TenantContextHolder.setTenantId(tenantId);
    }

    @AfterEach
    void tearDown() {
        TenantContextHolder.clear();
    }

    @Test
    void searchCarriers_findsMatchByFirstName() {
        userRepository.save(makeTrucker(tenantId, "Carlos", "Rivera", "carlos@test.com", EquipmentType.DRY_VAN));
        userRepository.save(makeTrucker(tenantId, "David", "Lee", "david@test.com", EquipmentType.FLATBED));

        List<CarrierSearchResult> results = carrierSearchService.searchCarriers(tenantId, "Car");

        assertThat(results).hasSize(1);
        assertThat(results.get(0).firstName()).isEqualTo("Carlos");
        assertThat(results.get(0).equipmentType()).isEqualTo("DRY_VAN");
    }

    @Test
    void searchCarriers_doesNotLeakAcrossTenants() {
        userRepository.save(makeTrucker(tenantId, "Alice", "Brown", "alice@test.com", null));
        userRepository.save(makeTrucker(otherTenantId, "Alicia", "Smith", "alicia@other.com", null));

        List<CarrierSearchResult> results = carrierSearchService.searchCarriers(tenantId, "Ali");

        assertThat(results).hasSize(1);
        assertThat(results.get(0).firstName()).isEqualTo("Alice");
    }

    @Test
    void searchCarriers_returnsEmptyForShortQuery() {
        userRepository.save(makeTrucker(tenantId, "Bob", "Taylor", "bob@test.com", null));

        List<CarrierSearchResult> results = carrierSearchService.searchCarriers(tenantId, "B");

        assertThat(results).isEmpty();
    }

    private Tenant makeTenant(String id) {
        Tenant tenant = new Tenant();
        tenant.setId(id);
        tenant.setName("Test Tenant " + id.substring(0, 8));
        tenant.setJoinCode("TST" + id.substring(0, 5).toUpperCase());
        return tenant;
    }

    private User makeTrucker(String tenantForUser, String firstName, String lastName,
                              String email, EquipmentType equipmentType) {
        User user = new User();
        user.setTenantId(tenantForUser);
        user.setRole(UserRole.TRUCKER);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email + "." + UUID.randomUUID());
        user.setPasswordHash("$2a$10$placeholder");
        user.setEquipmentType(equipmentType);
        return user;
    }
}
