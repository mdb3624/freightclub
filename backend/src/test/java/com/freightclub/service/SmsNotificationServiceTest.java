package com.freightclub.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThatNoException;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@ExtendWith(MockitoExtension.class)
class SmsNotificationServiceTest {

    @Test
    void shouldValidateE164PhoneNumber() {
        SmsNotificationService service = new SmsNotificationService(
            "test-sid", "test-token", "+15550000000", false
        );
        assertThatNoException().isThrownBy(() -> service.validatePhoneNumber("+12145551234"));
    }

    @Test
    void shouldRejectInvalidPhoneNumber() {
        SmsNotificationService service = new SmsNotificationService(
            "test-sid", "test-token", "+15550000000", false
        );
        assertThatThrownBy(() -> service.validatePhoneNumber("not-a-phone"))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Invalid phone number");
    }

    @Test
    void shouldNotSendWhenDisabled() {
        SmsNotificationService service = new SmsNotificationService(
            "test-sid", "test-token", "+15550000000", false  // enabled=false
        );
        // Should not throw, should not attempt Twilio API call
        assertThatNoException().isThrownBy(() -> service.send("+12145551234", "Test message"));
    }
}
