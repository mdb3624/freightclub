package com.freightclub.domain;

import org.junit.jupiter.api.Test;
import java.time.LocalDate;
import static org.assertj.core.api.Assertions.assertThat;

class UserTest {

    @Test
    void carrierIdentityCredentialsFields_roundTrip() {
        User user = new User("user-1");
        user.setEquipmentYear("2019");
        user.setEquipmentMake("Freightliner");
        user.setEquipmentModel("Cascadia");
        user.setLicensePlate("TX-4821");
        user.setVin("1FUJA6CV12LM12345");
        user.setCdlClass(CdlClass.CLASS_A);
        user.setCdlExpiry(LocalDate.of(2027, 8, 15));
        user.setInsuranceCarrier("Progressive Commercial");
        user.setInsuranceExpiry(LocalDate.of(2026, 10, 1));
        user.setMedCardExpiry(LocalDate.of(2026, 12, 1));

        assertThat(user.getEquipmentYear()).isEqualTo("2019");
        assertThat(user.getEquipmentMake()).isEqualTo("Freightliner");
        assertThat(user.getEquipmentModel()).isEqualTo("Cascadia");
        assertThat(user.getLicensePlate()).isEqualTo("TX-4821");
        assertThat(user.getVin()).isEqualTo("1FUJA6CV12LM12345");
        assertThat(user.getCdlClass()).isEqualTo(CdlClass.CLASS_A);
        assertThat(user.getCdlExpiry()).isEqualTo(LocalDate.of(2027, 8, 15));
        assertThat(user.getInsuranceCarrier()).isEqualTo("Progressive Commercial");
        assertThat(user.getInsuranceExpiry()).isEqualTo(LocalDate.of(2026, 10, 1));
        assertThat(user.getMedCardExpiry()).isEqualTo(LocalDate.of(2026, 12, 1));
    }
}
